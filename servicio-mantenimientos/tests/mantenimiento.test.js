const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/index');
const Mantenimiento = require('../src/models/Mantenimiento');

let mongoServer;
let mantenimientoId;

describe('Servicio de Mantenimientos - Tests', () => {
  // Setup antes de todos los tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // Cleanup después de todos los tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Limpiar colección antes de cada test
  beforeEach(async () => {
    await Mantenimiento.deleteMany({});
  });

  describe('POST /mantenimientos', () => {
    it('Debe crear un nuevo mantenimiento', async () => {
      const nuevoMantenimiento = {
        activoId: '550e8400-e29b-41d4-a716-446655440000',
        tipo: 'preventivo',
        descripcion: 'Mantenimiento preventivo trimestral del equipo de computo',
        fecha_inicio: '2024-01-15T08:00:00.000Z',
        costo: 150.00,
        tecnico: {
          nombre: 'Juan Pérez',
          contacto: '555-1234',
          especialidad: 'Sistemas'
        },
        piezas: [
          {
            nombre: 'Pasta térmica',
            cantidad: 1,
            costo: 15.00
          }
        ],
        prioridad: 'media',
        estado: 'pendiente'
      };

      const response = await request(app)
        .post('/mantenimientos')
        .send(nuevoMantenimiento)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.tipo).toBe(nuevoMantenimiento.tipo);
      expect(response.body.data.activoId).toBe(nuevoMantenimiento.activoId);

      mantenimientoId = response.body.data._id;
    });

    it('Debe rechazar un mantenimiento sin descripción', async () => {
      const mantenimientoInvalido = {
        activoId: '550e8400-e29b-41d4-a716-446655440000',
        tipo: 'correctivo',
        fecha_inicio: '2024-01-15',
        costo: 100.00,
        tecnico: {
          nombre: 'Juan Pérez'
        }
      };

      const response = await request(app)
        .post('/mantenimientos')
        .send(mantenimientoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('Debe validar el tipo de mantenimiento', async () => {
      const mantenimientoInvalido = {
        activoId: '550e8400-e29b-41d4-a716-446655440000',
        tipo: 'tipo_invalido',
        descripcion: 'Descripción del mantenimiento',
        fecha_inicio: '2024-01-15',
        costo: 100.00,
        tecnico: {
          nombre: 'Juan Pérez'
        }
      };

      const response = await request(app)
        .post('/mantenimientos')
        .send(mantenimientoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /mantenimientos', () => {
    beforeEach(async () => {
      // Crear mantenimientos de prueba
      await Mantenimiento.create([
        {
          activoId: 'activo-1',
          tipo: 'preventivo',
          descripcion: 'Mantenimiento preventivo 1',
          fecha_inicio: new Date(),
          costo: 100,
          tecnico: { nombre: 'Técnico 1' },
          estado: 'pendiente',
          prioridad: 'media'
        },
        {
          activoId: 'activo-2',
          tipo: 'correctivo',
          descripcion: 'Mantenimiento correctivo 1',
          fecha_inicio: new Date(),
          costo: 200,
          tecnico: { nombre: 'Técnico 2' },
          estado: 'completado',
          prioridad: 'alta'
        }
      ]);
    });

    it('Debe obtener todos los mantenimientos', async () => {
      const response = await request(app)
        .get('/mantenimientos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('Debe soportar paginación', async () => {
      const response = await request(app)
        .get('/mantenimientos?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('Debe filtrar por tipo', async () => {
      const response = await request(app)
        .get('/mantenimientos?tipo=preventivo')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(mant => {
        expect(mant.tipo).toBe('preventivo');
      });
    });

    it('Debe filtrar por estado', async () => {
      const response = await request(app)
        .get('/mantenimientos?estado=completado')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(mant => {
        expect(mant.estado).toBe('completado');
      });
    });
  });

  describe('GET /mantenimientos/:id', () => {
    let testMantenimientoId;

    beforeEach(async () => {
      const mant = await Mantenimiento.create({
        activoId: 'activo-test',
        tipo: 'preventivo',
        descripcion: 'Test mantenimiento',
        fecha_inicio: new Date(),
        costo: 100,
        tecnico: { nombre: 'Técnico Test' }
      });
      testMantenimientoId = mant._id;
    });

    it('Debe obtener un mantenimiento por ID', async () => {
      const response = await request(app)
        .get(`/mantenimientos/${testMantenimientoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testMantenimientoId.toString());
    });

    it('Debe retornar 404 para un ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/mantenimientos/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('Debe retornar 400 para un ID inválido', async () => {
      const response = await request(app)
        .get('/mantenimientos/id-invalido')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /mantenimientos/activo/:activoId', () => {
    beforeEach(async () => {
      await Mantenimiento.create([
        {
          activoId: 'activo-123',
          tipo: 'preventivo',
          descripcion: 'Mantenimiento 1',
          fecha_inicio: new Date(),
          costo: 100,
          tecnico: { nombre: 'Técnico 1' }
        },
        {
          activoId: 'activo-123',
          tipo: 'correctivo',
          descripcion: 'Mantenimiento 2',
          fecha_inicio: new Date(),
          costo: 200,
          tecnico: { nombre: 'Técnico 2' }
        },
        {
          activoId: 'activo-456',
          tipo: 'preventivo',
          descripcion: 'Mantenimiento 3',
          fecha_inicio: new Date(),
          costo: 150,
          tecnico: { nombre: 'Técnico 3' }
        }
      ]);
    });

    it('Debe obtener mantenimientos por activo', async () => {
      const response = await request(app)
        .get('/mantenimientos/activo/activo-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach(mant => {
        expect(mant.activoId).toBe('activo-123');
      });
    });
  });

  describe('PUT /mantenimientos/:id', () => {
    let testMantenimientoId;

    beforeEach(async () => {
      const mant = await Mantenimiento.create({
        activoId: 'activo-test',
        tipo: 'preventivo',
        descripcion: 'Test mantenimiento',
        fecha_inicio: new Date(),
        costo: 100,
        tecnico: { nombre: 'Técnico Test' }
      });
      testMantenimientoId = mant._id;
    });

    it('Debe actualizar un mantenimiento', async () => {
      const actualizacion = {
        activoId: 'activo-test',
        tipo: 'correctivo',
        descripcion: 'Mantenimiento actualizado',
        fecha_inicio: new Date().toISOString(),
        costo: 200,
        tecnico: { nombre: 'Técnico Actualizado' }
      };

      const response = await request(app)
        .put(`/mantenimientos/${testMantenimientoId}`)
        .send(actualizacion)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tipo).toBe('correctivo');
      expect(response.body.data.costo).toBe(200);
    });
  });

  describe('PATCH /mantenimientos/:id/estado', () => {
    let testMantenimientoId;

    beforeEach(async () => {
      const mant = await Mantenimiento.create({
        activoId: 'activo-test',
        tipo: 'preventivo',
        descripcion: 'Test mantenimiento',
        fecha_inicio: new Date(),
        costo: 100,
        tecnico: { nombre: 'Técnico Test' },
        estado: 'pendiente'
      });
      testMantenimientoId = mant._id;
    });

    it('Debe cambiar el estado de un mantenimiento', async () => {
      const response = await request(app)
        .patch(`/mantenimientos/${testMantenimientoId}/estado`)
        .send({ estado: 'en_proceso', usuario: 'Admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('en_proceso');
      expect(response.body.data.historial.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /mantenimientos/:id', () => {
    let testMantenimientoId;

    beforeEach(async () => {
      const mant = await Mantenimiento.create({
        activoId: 'activo-test',
        tipo: 'preventivo',
        descripcion: 'Test mantenimiento',
        fecha_inicio: new Date(),
        costo: 100,
        tecnico: { nombre: 'Técnico Test' }
      });
      testMantenimientoId = mant._id;
    });

    it('Debe eliminar un mantenimiento', async () => {
      const response = await request(app)
        .delete(`/mantenimientos/${testMantenimientoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar que se eliminó
      const verificacion = await request(app)
        .get(`/mantenimientos/${testMantenimientoId}`)
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
      expect(response.body.service).toBe('servicio-mantenimientos');
    });
  });
});
