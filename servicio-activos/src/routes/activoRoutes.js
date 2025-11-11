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

// Rutas con prefijos explícitos para evitar conflictos
// Listar y buscar
router.get("/lista", activoController.getAllActivos);
router.get("/buscar", activoController.searchActivos);
router.get("/stats", activoController.getEstadisticas);

// CRUD con prefijos claros
router.post("/crear", activoValidation, activoController.createActivo);
router.get("/ver/:id", activoController.getActivoById);
router.put("/actualizar/:id", activoValidation, activoController.updateActivo);
router.delete("/eliminar/:id", activoController.deleteActivo);

module.exports = router;
