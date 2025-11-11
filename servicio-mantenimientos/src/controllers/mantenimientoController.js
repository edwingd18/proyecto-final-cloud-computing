const { validationResult } = require("express-validator");
const Mantenimiento = require("../models/Mantenimiento");

// Obtener todos los mantenimientos con filtros
exports.getAllMantenimientos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      tipo,
      estado,
      prioridad,
      activoId,
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (prioridad) filter.prioridad = prioridad;
    if (activoId) filter.activoId = activoId;

    const total = await Mantenimiento.countDocuments(filter);
    const mantenimientos = await Mantenimiento.find(filter)
      .sort({ fecha_inicio: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: mantenimientos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener mantenimientos",
      error: error.message,
    });
  }
};

// Obtener un mantenimiento por ID
exports.getMantenimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const mantenimiento = await Mantenimiento.findById(id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    res.json({
      success: true,
      data: mantenimiento,
    });
  } catch (error) {
    console.error("Error al obtener mantenimiento:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de mantenimiento inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al obtener mantenimiento",
      error: error.message,
    });
  }
};

// Obtener mantenimientos por activo
exports.getMantenimientosByActivo = async (req, res) => {
  try {
    const { activoId } = req.params;
    const mantenimientos = await Mantenimiento.find({ activoId }).sort({
      fecha_inicio: -1,
    });

    res.json({
      success: true,
      data: mantenimientos,
      count: mantenimientos.length,
    });
  } catch (error) {
    console.error("Error al obtener mantenimientos del activo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener mantenimientos del activo",
      error: error.message,
    });
  }
};

// Crear un nuevo mantenimiento
exports.createMantenimiento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const mantenimiento = new Mantenimiento(req.body);
    await mantenimiento.save();

    res.status(201).json({
      success: true,
      message: "Mantenimiento creado exitosamente",
      data: mantenimiento,
    });
  } catch (error) {
    console.error("Error al crear mantenimiento:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear mantenimiento",
      error: error.message,
    });
  }
};

// Actualizar un mantenimiento
exports.updateMantenimiento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // Validación manual de fechas
    if (req.body.fecha_fin && req.body.fecha_inicio) {
      const fechaInicio = new Date(req.body.fecha_inicio);
      const fechaFin = new Date(req.body.fecha_fin);

      if (fechaFin < fechaInicio) {
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: [
            {
              field: "fecha_fin",
              message:
                "La fecha de fin debe ser posterior o igual a la fecha de inicio",
            },
          ],
        });
      }
    }

    // Buscar el mantenimiento existente
    const mantenimientoExistente = await Mantenimiento.findById(id);

    if (!mantenimientoExistente) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    // Actualizar campos
    Object.assign(mantenimientoExistente, req.body);

    // Guardar con validaciones
    await mantenimientoExistente.save();

    res.json({
      success: true,
      message: "Mantenimiento actualizado exitosamente",
      data: mantenimientoExistente,
    });
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de mantenimiento inválido",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar mantenimiento",
      error: error.message,
    });
  }
};

// Eliminar un mantenimiento
exports.deleteMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const mantenimiento = await Mantenimiento.findByIdAndDelete(id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Mantenimiento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de mantenimiento inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar mantenimiento",
      error: error.message,
    });
  }
};

// Cambiar estado de un mantenimiento
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, usuario = "Sistema" } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: "El estado es requerido",
      });
    }

    const mantenimiento = await Mantenimiento.findById(id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    await mantenimiento.cambiarEstado(estado, usuario);

    res.json({
      success: true,
      message: "Estado actualizado exitosamente",
      data: mantenimiento,
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de mantenimiento inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al cambiar estado",
      error: error.message,
    });
  }
};

// Agregar nota a un mantenimiento
exports.agregarNota = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, autor } = req.body;

    if (!descripcion || !autor) {
      return res.status(400).json({
        success: false,
        message: "La descripción y el autor son requeridos",
      });
    }

    const mantenimiento = await Mantenimiento.findById(id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    await mantenimiento.agregarNota(descripcion, autor);

    res.json({
      success: true,
      message: "Nota agregada exitosamente",
      data: mantenimiento,
    });
  } catch (error) {
    console.error("Error al agregar nota:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar nota",
      error: error.message,
    });
  }
};

// Obtener estadísticas de mantenimientos
exports.getEstadisticas = async (req, res) => {
  try {
    const total = await Mantenimiento.countDocuments();

    const porEstado = await Mantenimiento.aggregate([
      {
        $group: {
          _id: "$estado",
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const porTipo = await Mantenimiento.aggregate([
      {
        $group: {
          _id: "$tipo",
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const porPrioridad = await Mantenimiento.aggregate([
      {
        $group: {
          _id: "$prioridad",
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const costoTotal = await Mantenimiento.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$costo" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        total,
        porEstado,
        porTipo,
        porPrioridad,
        costoTotal: costoTotal[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
