const Activo = require('../models/Activo');

const activosEjemplo = [
  {
    nombre: 'Laptop HP ProBook 450',
    descripcion: 'Laptop para desarrollo de software',
    numero_serie: 'HP-2024-001',
    categoria: 'equipo_computo',
    fecha_adquisicion: '2024-01-15',
    costo: 1500.00,
    ubicacion: 'Oficina Principal - Piso 2',
    estado: 'activo'
  },
  {
    nombre: 'Impresora HP LaserJet Pro',
    descripcion: 'Impresora láser a color',
    numero_serie: 'HP-PRINT-2024-001',
    categoria: 'electronico',
    fecha_adquisicion: '2024-02-10',
    costo: 450.00,
    ubicacion: 'Oficina Principal - Piso 1',
    estado: 'activo'
  },
  {
    nombre: 'Escritorio Ejecutivo',
    descripcion: 'Escritorio de madera con cajones',
    numero_serie: 'MOB-2024-001',
    categoria: 'mobiliario',
    fecha_adquisicion: '2023-12-01',
    costo: 350.00,
    ubicacion: 'Oficina Gerencia',
    estado: 'activo'
  },
  {
    nombre: 'Servidor Dell PowerEdge',
    descripcion: 'Servidor de base de datos principal',
    numero_serie: 'DELL-SRV-2024-001',
    categoria: 'equipo_computo',
    fecha_adquisicion: '2023-11-20',
    costo: 3500.00,
    ubicacion: 'Sala de Servidores',
    estado: 'activo'
  },
  {
    nombre: 'Router Cisco 2900',
    descripcion: 'Router principal de red',
    numero_serie: 'CISCO-2024-001',
    categoria: 'electronico',
    fecha_adquisicion: '2024-01-05',
    costo: 800.00,
    ubicacion: 'Sala de Telecomunicaciones',
    estado: 'en_reparacion'
  }
];

const seedActivos = async () => {
  try {
    // Verificar si ya existen datos
    const count = await Activo.count();
    if (count > 0) {
      console.log('La base de datos ya contiene activos. No se insertarán datos de ejemplo.');
      return;
    }

    // Insertar datos de ejemplo
    await Activo.bulkCreate(activosEjemplo);
    console.log('✅ Datos de ejemplo insertados correctamente en Activos');
  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error);
  }
};

module.exports = { seedActivos };
