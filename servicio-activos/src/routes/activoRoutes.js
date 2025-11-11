const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const activoController = require("../controllers/activoController");

// Validaciones
const activoValidation = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  body("descripcion").optional().trim(),

  body("numero_serie")
    .trim()
    .notEmpty()
    .withMessage("El número de serie es requerido"),

  body("categoria")
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isIn([
      "electronico",
      "maquinaria",
      "vehiculo",
      "mobiliario",
      "equipo_computo",
      "herramienta",
      "otro",
    ])
    .withMessage("Categoría no válida"),

  body("fecha_adquisicion")
    .notEmpty()
    .withMessage("La fecha de adquisición es requerida")
    .isDate()
    .withMessage("Debe ser una fecha válida"),

  body("costo")
    .notEmpty()
    .withMessage("El costo es requerido")
    .isFloat({ min: 0 })
    .withMessage("El costo debe ser un número mayor o igual a 0"),

  body("ubicacion").trim().notEmpty().withMessage("La ubicación es requerida"),

  body("estado")
    .optional()
    .isIn(["activo", "inactivo", "en_reparacion", "dado_de_baja"])
    .withMessage("Estado no válido"),
];

// Rutas - Orden importante: rutas específicas primero antes de /:id
router.get("/search", activoController.searchActivos);
router.get("/estadisticas", activoController.getEstadisticas);

// POST - Usar ruta específica /nuevo para evitar conflictos
router.post("/nuevo", activoValidation, activoController.createActivo);
router.post("/", activoValidation, activoController.createActivo);

// Rutas con parámetros al final
router.get("/:id", activoController.getActivoById);
router.put("/:id", activoValidation, activoController.updateActivo);
router.delete("/:id", activoController.deleteActivo);

// GET all al final
router.get("/", activoController.getAllActivos);

module.exports = router;
