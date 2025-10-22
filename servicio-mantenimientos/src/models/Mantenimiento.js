const mongoose = require('mongoose');

// Schema para las piezas utilizadas
const piezaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la pieza es requerido'],
    trim: true
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser al menos 1']
  },
  costo: {
    type: Number,
    required: [true, 'El costo es requerido'],
    min: [0, 'El costo debe ser mayor o igual a 0']
  }
}, { _id: false });

// Schema para las notas del mantenimiento
const notaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción de la nota es requerida'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'El autor de la nota es requerido'],
    trim: true
  }
}, { _id: true });

// Schema para el historial de cambios
const historialSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  cambio: {
    type: String,
    required: true,
    trim: true
  },
  usuario: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Schema para información del técnico
const tecnicoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del técnico es requerido'],
    trim: true
  },
  contacto: {
    type: String,
    trim: true
  },
  especialidad: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema principal de Mantenimiento
const mantenimientoSchema = new mongoose.Schema({
  activoId: {
    type: String,
    required: [true, 'El ID del activo es requerido'],
    index: true
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de mantenimiento es requerido'],
    enum: {
      values: ['preventivo', 'correctivo', 'predictivo', 'emergencia'],
      message: '{VALUE} no es un tipo de mantenimiento válido'
    },
    index: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  fecha_inicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
    index: true
  },
  fecha_fin: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // fecha_fin es opcional
        return value >= this.fecha_inicio;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  costo: {
    type: Number,
    required: [true, 'El costo es requerido'],
    min: [0, 'El costo debe ser mayor o igual a 0'],
    default: 0
  },
  tecnico: {
    type: tecnicoSchema,
    required: [true, 'La información del técnico es requerida']
  },
  piezas: {
    type: [piezaSchema],
    default: []
  },
  estado: {
    type: String,
    required: true,
    enum: {
      values: ['pendiente', 'en_proceso', 'completado', 'cancelado'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pendiente',
    index: true
  },
  prioridad: {
    type: String,
    required: true,
    enum: {
      values: ['baja', 'media', 'alta', 'critica'],
      message: '{VALUE} no es una prioridad válida'
    },
    default: 'media',
    index: true
  },
  notas: {
    type: [notaSchema],
    default: []
  },
  historial: {
    type: [historialSchema],
    default: []
  },
  duracion_estimada: {
    type: Number, // en horas
    min: [0, 'La duración estimada debe ser mayor o igual a 0']
  },
  duracion_real: {
    type: Number, // en horas
    min: [0, 'La duración real debe ser mayor o igual a 0']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular el costo total (costo + piezas)
mantenimientoSchema.virtual('costo_total').get(function() {
  const costoPiezas = this.piezas.reduce((total, pieza) => {
    return total + (pieza.costo * pieza.cantidad);
  }, 0);
  return this.costo + costoPiezas;
});

// Middleware pre-save para agregar al historial
mantenimientoSchema.pre('save', function(next) {
  if (this.isModified('estado')) {
    this.historial.push({
      fecha: new Date(),
      cambio: `Estado cambiado a: ${this.estado}`,
      usuario: 'Sistema'
    });
  }
  next();
});

// Índices compuestos para búsquedas eficientes
mantenimientoSchema.index({ activoId: 1, fecha_inicio: -1 });
mantenimientoSchema.index({ estado: 1, prioridad: 1 });
mantenimientoSchema.index({ tipo: 1, estado: 1 });

// Métodos del modelo
mantenimientoSchema.methods.agregarNota = function(descripcion, autor) {
  this.notas.push({ descripcion, autor });
  return this.save();
};

mantenimientoSchema.methods.cambiarEstado = function(nuevoEstado, usuario = 'Sistema') {
  this.estado = nuevoEstado;
  this.historial.push({
    fecha: new Date(),
    cambio: `Estado cambiado a: ${nuevoEstado}`,
    usuario
  });
  return this.save();
};

const Mantenimiento = mongoose.model('Mantenimiento', mantenimientoSchema);

module.exports = Mantenimiento;
