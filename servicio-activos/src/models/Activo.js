const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activo = sequelize.define('Activo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es requerido' },
      len: { args: [3, 100], msg: 'El nombre debe tener entre 3 y 100 caracteres' }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  numero_serie: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'El número de serie ya existe'
    },
    validate: {
      notEmpty: { msg: 'El número de serie es requerido' }
    }
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La categoría es requerida' },
      isIn: {
        args: [['electronico', 'maquinaria', 'vehiculo', 'mobiliario', 'equipo_computo', 'herramienta', 'otro']],
        msg: 'Categoría no válida'
      }
    }
  },
  fecha_adquisicion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Debe ser una fecha válida' },
      notEmpty: { msg: 'La fecha de adquisición es requerida' }
    }
  },
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'El costo debe ser un número decimal' },
      min: { args: [0], msg: 'El costo debe ser mayor o igual a 0' }
    }
  },
  ubicacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La ubicación es requerida' }
    }
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'en_reparacion', 'dado_de_baja'),
    defaultValue: 'activo',
    allowNull: false
  }
}, {
  tableName: 'activos',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['numero_serie'] },
    { fields: ['categoria'] },
    { fields: ['estado'] }
  ]
});

module.exports = Activo;
