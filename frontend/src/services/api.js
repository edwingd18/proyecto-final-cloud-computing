import axios from "axios";

// En producción usar directamente los servicios, en desarrollo usar el gateway
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://servicio-activos-production.up.railway.app"
    : "http://localhost:3000/api");

const api = axios.create({
  baseURL: API_URL.replace(/\/$/, ""), // Eliminar trailing slash si existe
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  maxRedirects: 0, // Evitar seguir redirects automáticamente
});

// Interceptor para agregar token si existe (futuro)
api.interceptors.request.use(
  (config) => {
    // Aquí se puede agregar token de autenticación en el futuro
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    console.error("Error en API:", message);
    return Promise.reject(error);
  }
);

export default api;
