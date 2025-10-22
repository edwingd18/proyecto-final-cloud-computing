const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mantenimientoController = require('../controllers/mantenimientoController');

// Validaciones
const mantenimientoValidation = [
  body('activoId')
    .trim()
    .notEmpty().withMessage('El ID del activo es requerido'),

  body('tipo')
    .notEmpty().withMessage('El tipo de mantenimiento es requerido')
    .isIn(['preventivo', 'correctivo', 'predictivo', 'emergencia'])
    .withMessage('Tipo de mantenimiento no válido'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isISO8601().withMessage('Debe ser una fecha válida'),

  body('fecha_fin')
    .optional()
    .isISO8601().withMessage('Debe ser una fecha válida'),

  body('costo')
    .notEmpty().withMessage('El costo es requerido')
    .isFloat({ min: 0 }).withMessage('El costo debe ser mayor o igual a 0'),

  body('tecnico.nombre')
    .trim()
    .notEmpty().withMessage('El nombre del técnico es requerido'),

  body('tecnico.contacto')
    .optional()
    .trim(),

  body('tecnico.especialidad')
    .optional()
    .trim(),

  body('piezas')
    .optional()
    .isArray().withMessage('Las piezas deben ser un array'),

  body('piezas.*.nombre')
    .if(body('piezas').exists())
    .trim()
    .notEmpty().withMessage('El nombre de la pieza es requerido'),

  body('piezas.*.cantidad')
    .if(body('piezas').exists())
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),

  body('piezas.*.costo')
    .if(body('piezas').exists())
    .isFloat({ min: 0 }).withMessage('El costo de la pieza debe ser mayor o igual a 0'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'completado', 'cancelado'])
    .withMessage('Estado no válido'),

  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta', 'critica'])
    .withMessage('Prioridad no válida'),

  body('duracion_estimada')
    .optional()
    .isFloat({ min: 0 }).withMessage('La duración estimada debe ser mayor o igual a 0'),

  body('duracion_real')
    .optional()
    .isFloat({ min: 0 }).withMessage('La duración real debe ser mayor o igual a 0')
];

// Rutas
router.get('/', mantenimientoController.getAllMantenimientos);
router.get('/estadisticas', mantenimientoController.getEstadisticas);
router.get('/activo/:activoId', mantenimientoController.getMantenimientosByActivo);
router.get('/:id', mantenimientoController.getMantenimientoById);
router.post('/', mantenimientoValidation, mantenimientoController.createMantenimiento);
router.put('/:id', mantenimientoValidation, mantenimientoController.updateMantenimiento);
router.delete('/:id', mantenimientoController.deleteMantenimiento);
router.patch('/:id/estado', mantenimientoController.cambiarEstado);
router.post('/:id/notas', mantenimientoController.agregarNota);

module.exports = router;
