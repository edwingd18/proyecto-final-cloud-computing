const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/database');
const Activo = require('../src/models/Activo');

describe('Servicio de Activos - Tests', () => {
  let activoId;

  // Setup antes de todos los tests
  beforeAll(async () => {
    // Eliminar tipos ENUM existentes antes de sincronizar
    await sequelize.query('DROP TYPE IF EXISTS "enum_activos_estado" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_activos_categoria" CASCADE;');

    // Sincronizar modelos (force: true elimina y recrea tablas)
    await sequelize.sync({ force: true });
  });

  // Cleanup después de todos los tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /activos', () => {
    it('Debe crear un nuevo activo', async () => {
      const nuevoActivo = {
        nombre: 'Laptop HP ProBook',
        descripcion: 'Laptop para desarrollo',
        numero_serie: 'HP-2024-001',
        categoria: 'equipo_computo',
        fecha_adquisicion: '2024-01-15',
        costo: 1500.00,
        ubicacion: 'Oficina Principal',
        estado: 'activo'
      };

      const response = await request(app)
        .post('/activos')
        .send(nuevoActivo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(nuevoActivo.nombre);
      expect(response.body.data.numero_serie).toBe(nuevoActivo.numero_serie);

      activoId = response.body.data.id;
    });

    it('Debe rechazar un activo sin nombre', async () => {
      const activoInvalido = {
        descripcion: 'Sin nombre',
        numero_serie: 'HP-2024-002',
        categoria: 'equipo_computo',
        fecha_adquisicion: '2024-01-15',
        costo: 1500.00,
        ubicacion: 'Oficina Principal'
      };

      const response = await request(app)
        .post('/activos')
        .send(activoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('Debe rechazar un número de serie duplicado', async () => {
      const activoDuplicado = {
        nombre: 'Laptop Dell',
        numero_serie: 'HP-2024-001', // Duplicado
        categoria: 'equipo_computo',
        fecha_adquisicion: '2024-01-15',
        costo: 1200.00,
        ubicacion: 'Oficina Principal'
      };

      const response = await request(app)
        .post('/activos')
        .send(activoDuplicado)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /activos', () => {
    it('Debe obtener todos los activos', async () => {
      const response = await request(app)
        .get('/activos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('Debe soportar paginación', async () => {
      const response = await request(app)
        .get('/activos?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('Debe filtrar por categoría', async () => {
      const response = await request(app)
        .get('/activos?categoria=equipo_computo')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(activo => {
        expect(activo.categoria).toBe('equipo_computo');
      });
    });
  });

  describe('GET /activos/:id', () => {
    it('Debe obtener un activo por ID', async () => {
      const response = await request(app)
        .get(`/activos/${activoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(activoId);
    });

    it('Debe retornar 404 para un ID inexistente', async () => {
      const response = await request(app)
        .get('/activos/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /activos/:id', () => {
    it('Debe actualizar un activo', async () => {
      const actualizacion = {
        nombre: 'Laptop HP ProBook ACTUALIZADA',
        descripcion: 'Laptop actualizada',
        numero_serie: 'HP-2024-001',
        categoria: 'equipo_computo',
        fecha_adquisicion: '2024-01-15',
        costo: 1600.00,
        ubicacion: 'Oficina Principal',
        estado: 'activo'
      };

      const response = await request(app)
        .put(`/activos/${activoId}`)
        .send(actualizacion)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(actualizacion.nombre);
      expect(parseFloat(response.body.data.costo)).toBe(1600.00);
    });
  });

  describe('GET /activos/search', () => {
    it('Debe buscar activos por término', async () => {
      const response = await request(app)
        .get('/activos/search?q=HP')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('Debe retornar error sin parámetro de búsqueda', async () => {
      const response = await request(app)
        .get('/activos/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /activos/:id', () => {
    it('Debe eliminar un activo', async () => {
      const response = await request(app)
        .delete(`/activos/${activoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar que realmente se eliminó
      const verificacion = await request(app)
        .get(`/activos/${activoId}`)
        .expect(404);

      expect(verificacion.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('Debe retornar el estado del servicio', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('servicio-activos');
    });
  });
});
