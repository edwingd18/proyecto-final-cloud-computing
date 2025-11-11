const request = require("supertest");
const app = require("../src/index");
const { sequelize } = require("../src/config/database");

describe("Servicio de Activos - Tests", () => {
  let activoId;

  // Setup antes de todos los tests
  beforeAll(async () => {
    // Eliminar tipos ENUM existentes antes de sincronizar
    await sequelize.query('DROP TYPE IF EXISTS "enum_activos_estado" CASCADE;');
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_activos_categoria" CASCADE;'
    );

    // Sincronizar modelos (force: true elimina y recrea tablas)
    await sequelize.sync({ force: true });
  });

  // Cleanup después de todos los tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /activos/crear", () => {
    it("Debe crear un nuevo activo", async () => {
      const nuevoActivo = {
        nombre: "Laptop HP ProBook",
        descripcion: "Laptop para desarrollo",
        numero_serie: "HP-2024-001",
        categoria: "equipo_computo",
        fecha_adquisicion: "2024-01-15",
        costo: 1500.0,
        ubicacion: "Oficina Principal",
        estado: "activo",
      };

      const response = await request(app)
        .post("/activos/crear")
        .send(nuevoActivo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.nombre).toBe(nuevoActivo.nombre);
      expect(response.body.data.numero_serie).toBe(nuevoActivo.numero_serie);

      activoId = response.body.data.id;
    });

    it("Debe rechazar un activo sin nombre", async () => {
      const activoInvalido = {
        descripcion: "Sin nombre",
        numero_serie: "HP-2024-002",
        categoria: "equipo_computo",
        fecha_adquisicion: "2024-01-15",
        costo: 1500.0,
        ubicacion: "Oficina Principal",
      };

      const response = await request(app)
        .post("/activos/crear")
        .send(activoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("Debe rechazar un número de serie duplicado", async () => {
      const activoDuplicado = {
        nombre: "Laptop Dell",
        numero_serie: "HP-2024-001", // Duplicado
        categoria: "equipo_computo",
        fecha_adquisicion: "2024-01-15",
        costo: 1200.0,
        ubicacion: "Oficina Principal",
      };

      const response = await request(app)
        .post("/activos/crear")
        .send(activoDuplicado)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /activos/lista", () => {
    it("Debe obtener todos los activos", async () => {
      const response = await request(app).get("/activos/lista").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it("Debe soportar paginación", async () => {
      const response = await request(app)
        .get("/activos/lista?page=1&limit=5")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it("Debe filtrar por categoría", async () => {
      const response = await request(app)
        .get("/activos/lista?categoria=equipo_computo")
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((activo) => {
        expect(activo.categoria).toBe("equipo_computo");
      });
    });
  });

  describe("GET /activos/ver/:id", () => {
    it("Debe obtener un activo por ID", async () => {
      const response = await request(app)
        .get(`/activos/ver/${activoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(activoId);
    });

    it("Debe retornar 404 para un ID inexistente", async () => {
      const response = await request(app)
        .get("/activos/ver/550e8400-e29b-41d4-a716-446655440000")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /activos/actualizar/:id", () => {
    it("Debe actualizar un activo", async () => {
      const actualizacion = {
        nombre: "Laptop HP ProBook ACTUALIZADA",
        descripcion: "Laptop actualizada",
        numero_serie: "HP-2024-001",
        categoria: "equipo_computo",
        fecha_adquisicion: "2024-01-15",
        costo: 1600.0,
        ubicacion: "Oficina Principal",
        estado: "activo",
      };

      const response = await request(app)
        .put(`/activos/actualizar/${activoId}`)
        .send(actualizacion)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(actualizacion.nombre);
      expect(parseFloat(response.body.data.costo)).toBe(1600.0);
    });
  });

  describe("GET /activos/buscar", () => {
    it("Debe buscar activos por término", async () => {
      const response = await request(app)
        .get("/activos/buscar?q=HP")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it("Debe retornar error sin parámetro de búsqueda", async () => {
      const response = await request(app).get("/activos/buscar").expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /activos/stats", () => {
    it("Debe obtener estadísticas de activos", async () => {
      const response = await request(app).get("/activos/stats").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("porEstado");
      expect(response.body.data).toHaveProperty("porCategoria");
    });
  });

  describe("DELETE /activos/eliminar/:id", () => {
    it("Debe eliminar un activo", async () => {
      const response = await request(app)
        .delete(`/activos/eliminar/${activoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar que realmente se eliminó
      const verificacion = await request(app)
        .get(`/activos/ver/${activoId}`)
        .expect(404);

      expect(verificacion.body.success).toBe(false);
    });
  });

  describe("GET /health", () => {
    it("Debe retornar el estado del servicio", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("ok");
      expect(response.body.service).toBe("servicio-activos");
    });
  });
});
