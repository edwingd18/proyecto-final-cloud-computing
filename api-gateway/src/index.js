const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar trust proxy para Railway (necesario para rate limiting y proxies)
app.set("trust proxy", 1);

// DESHABILITAR strict routing para que /api/activos y /api/activos/ sean iguales
app.disable("strict routing");

// Middleware para eliminar trailing slashes y evitar redirects
app.use((req, res, next) => {
  if (req.path !== "/" && req.path.endsWith("/")) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1);
    // Reescribir la URL sin hacer redirect
    req.url = safepath + query;
  }
  next();
});

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: {
    success: false,
    message:
      "Demasiadas solicitudes desde esta IP, por favor intente más tarde",
  },
});

// Middleware global
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev"));
app.use(limiter);

// Health check del gateway
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Debug endpoint para verificar configuración
app.get("/debug/config", (req, res) => {
  res.json({
    service: "api-gateway",
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    services: {
      activos: process.env.ACTIVOS_SERVICE_URL || "NOT CONFIGURED",
      mantenimientos:
        process.env.MANTENIMIENTOS_SERVICE_URL || "NOT CONFIGURED",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check de todos los servicios
app.get("/health/all", async (req, res) => {
  const services = {
    gateway: { status: "ok" },
    activos: { url: process.env.ACTIVOS_SERVICE_URL },
    mantenimientos: { url: process.env.MANTENIMIENTOS_SERVICE_URL },
  };

  try {
    // Intentar verificar servicios
    const fetch = require("http");

    res.json({
      success: true,
      services,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar servicios",
      error: error.message,
    });
  }
});

// Configuración del proxy para el servicio de activos
const activosProxy = createProxyMiddleware({
  target:
    process.env.ACTIVOS_SERVICE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://servicio-activos-production.up.railway.app"
      : "http://localhost:3001"),
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    "^/api/activos": "/activos",
  },
  onError: (err, req, res) => {
    console.error("Error en proxy de activos:", err.message);
    res.status(503).json({
      success: false,
      message: "Servicio de activos no disponible",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `[Activos] ${req.method} ${req.originalUrl} -> ${proxyReq.method} ${proxyReq.path}`
    );

    // Asegurar que el Content-Type y body se preserven en POST/PUT
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
});

// Configuración del proxy para el servicio de mantenimientos
const mantenimientosProxy = createProxyMiddleware({
  target:
    process.env.MANTENIMIENTOS_SERVICE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://servicio-mantenimientos-production.up.railway.app"
      : "http://localhost:3002"),
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    "^/api/mantenimientos": "/mantenimientos",
  },
  onError: (err, req, res) => {
    console.error("Error en proxy de mantenimientos:", err.message);
    res.status(503).json({
      success: false,
      message: "Servicio de mantenimientos no disponible",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `[Mantenimientos] ${req.method} ${req.path} -> ${process.env.MANTENIMIENTOS_SERVICE_URL}${req.path}`
    );
  },
});

// Rutas del gateway - Orden importante: sin slash primero
app.use("/api/activos", activosProxy);
app.use("/api/mantenimientos", mantenimientosProxy);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Gateway de Gestión de Activos y Mantenimientos",
    version: "1.0.0",
    endpoints: {
      activos: "/api/activos",
      mantenimientos: "/api/mantenimientos",
      health: "/health",
      healthAll: "/health/all",
    },
    documentation: {
      activos: {
        base: "/api/activos",
        endpoints: [
          "GET /api/activos/lista - Listar todos los activos",
          "GET /api/activos/ver/:id - Obtener un activo",
          "GET /api/activos/buscar?q= - Buscar activos",
          "GET /api/activos/stats - Estadísticas",
          "POST /api/activos/crear - Crear activo",
          "PUT /api/activos/actualizar/:id - Actualizar activo",
          "DELETE /api/activos/eliminar/:id - Eliminar activo",
        ],
      },
      mantenimientos: {
        base: "/api/mantenimientos",
        endpoints: [
          "GET /api/mantenimientos/lista - Listar todos los mantenimientos",
          "GET /api/mantenimientos/ver/:id - Obtener un mantenimiento",
          "GET /api/mantenimientos/por-activo/:activoId - Mantenimientos por activo",
          "GET /api/mantenimientos/stats - Estadísticas",
          "POST /api/mantenimientos/crear - Crear mantenimiento",
          "PUT /api/mantenimientos/actualizar/:id - Actualizar mantenimiento",
          "PATCH /api/mantenimientos/cambiar-estado/:id - Cambiar estado",
          "POST /api/mantenimientos/agregar-nota/:id - Agregar nota",
          "DELETE /api/mantenimientos/:id - Eliminar mantenimiento",
        ],
      },
    },
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada en el API Gateway",
    path: req.path,
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado en gateway:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del gateway",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API Gateway corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📡 Servicio de Activos: ${
      process.env.ACTIVOS_SERVICE_URL || "http://localhost:3001"
    }`
  );
  console.log(
    `📡 Servicio de Mantenimientos: ${
      process.env.MANTENIMIENTOS_SERVICE_URL || "http://localhost:3002"
    }`
  );
  console.log(`\n📝 Documentación disponible en: http://localhost:${PORT}/`);
});

module.exports = app;
