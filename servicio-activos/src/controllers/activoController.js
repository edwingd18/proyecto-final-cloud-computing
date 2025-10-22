const { validationResult } = require('express-validator');
const Activo = require('../models/Activo');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Obtener todos los activos con paginación y filtros
exports.getAllActivos = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria, estado, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } },
        { numero_serie: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Activo.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener activos',
      error: error.message
    });
  }
};

// Obtener un activo por ID
exports.getActivoById = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await Activo.findByPk(id);

    if (!activo) {
      return res.status(404).json({
        success: false,
        message: 'Activo no encontrado'
      });
    }

    res.json({
      success: true,
      data: activo
    });
  } catch (error) {
    console.error('Error al obtener activo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener activo',
      error: error.message
    });
  }
};

// Crear un nuevo activo
exports.createActivo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activo = await Activo.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Activo creado exitosamente',
      data: activo
    });
  } catch (error) {
    console.error('Error al crear activo:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'El número de serie ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear activo',
      error: error.message
    });
  }
};

// Actualizar un activo
exports.updateActivo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const activo = await Activo.findByPk(id);

    if (!activo) {
      return res.status(404).json({
        success: false,
        message: 'Activo no encontrado'
      });
    }

    await activo.update(req.body);

    res.json({
      success: true,
      message: 'Activo actualizado exitosamente',
      data: activo
    });
  } catch (error) {
    console.error('Error al actualizar activo:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar activo',
      error: error.message
    });
  }
};

// Eliminar un activo
exports.deleteActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await Activo.findByPk(id);

    if (!activo) {
      return res.status(404).json({
        success: false,
        message: 'Activo no encontrado'
      });
    }

    await activo.destroy();

    res.json({
      success: true,
      message: 'Activo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar activo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar activo',
      error: error.message
    });
  }
};

// Búsqueda de activos
exports.searchActivos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda es requerido'
      });
    }

    const activos = await Activo.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${q}%` } },
          { descripcion: { [Op.iLike]: `%${q}%` } },
          { numero_serie: { [Op.iLike]: `%${q}%` } },
          { ubicacion: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 20,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: activos,
      count: activos.length
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};

// Estadísticas de activos
exports.getEstadisticas = async (req, res) => {
  try {
    const total = await Activo.count();
    const porEstado = await Activo.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['estado']
    });

    const porCategoria = await Activo.findAll({
      attributes: [
        'categoria',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['categoria']
    });

    res.json({
      success: true,
      data: {
        total,
        porEstado,
        porCategoria
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
