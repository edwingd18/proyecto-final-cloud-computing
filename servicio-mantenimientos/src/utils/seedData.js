const Mantenimiento = require('../models/Mantenimiento');

const mantenimientosEjemplo = [
  {
    activoId: 'ejemplo-activo-1',
    tipo: 'preventivo',
    descripcion: 'Mantenimiento preventivo trimestral - Limpieza interna, actualización de software y revisión de componentes',
    fecha_inicio: new Date('2024-01-20T09:00:00'),
    fecha_fin: new Date('2024-01-20T11:00:00'),
    costo: 150.00,
    tecnico: {
      nombre: 'Juan Pérez',
      contacto: '555-1234',
      especialidad: 'Sistemas y Hardware'
    },
    piezas: [
      {
        nombre: 'Pasta térmica',
        cantidad: 1,
        costo: 15.00
      },
      {
        nombre: 'Aire comprimido',
        cantidad: 1,
        costo: 10.00
      }
    ],
    estado: 'completado',
    prioridad: 'media',
    duracion_estimada: 2,
    duracion_real: 2,
    notas: [
      {
        descripcion: 'Se realizó limpieza completa del equipo',
        autor: 'Juan Pérez'
      }
    ]
  },
  {
    activoId: 'ejemplo-activo-2',
    tipo: 'correctivo',
    descripcion: 'Reparación de atasco de papel y reemplazo de rodillos de alimentación',
    fecha_inicio: new Date('2024-02-15T14:00:00'),
    costo: 80.00,
    tecnico: {
      nombre: 'María García',
      contacto: '555-5678',
      especialidad: 'Impresoras y Periféricos'
    },
    piezas: [
      {
        nombre: 'Rodillos de alimentación',
        cantidad: 2,
        costo: 45.00
      }
    ],
    estado: 'en_proceso',
    prioridad: 'alta',
    duracion_estimada: 1.5,
    notas: [
      {
        descripcion: 'Diagnosticado problema en rodillos',
        autor: 'María García'
      }
    ]
  },
  {
    activoId: 'ejemplo-activo-3',
    tipo: 'emergencia',
    descripcion: 'Falla crítica en router principal - Sin conectividad de red en toda la oficina',
    fecha_inicio: new Date('2024-02-20T08:00:00'),
    costo: 200.00,
    tecnico: {
      nombre: 'Carlos Rodríguez',
      contacto: '555-9012',
      especialidad: 'Redes y Telecomunicaciones'
    },
    estado: 'pendiente',
    prioridad: 'critica',
    duracion_estimada: 3,
    notas: [
      {
        descripcion: 'Reporte de emergencia - Prioridad crítica',
        autor: 'Sistema'
      }
    ]
  }
];

const seedMantenimientos = async () => {
  try {
    // Verificar si ya existen datos
    const count = await Mantenimiento.countDocuments();
    if (count > 0) {
      console.log('La base de datos ya contiene mantenimientos. No se insertarán datos de ejemplo.');
      return;
    }

    // Insertar datos de ejemplo
    await Mantenimiento.insertMany(mantenimientosEjemplo);
    console.log('✅ Datos de ejemplo insertados correctamente en Mantenimientos');
  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error);
  }
};

module.exports = { seedMantenimientos };
