const { body, query } = require('express-validator');
const { MOTIVOS_REPORTE } = require('../config/constantes');

const filtroWorkspace = query('workspace').optional().isMongoId().withMessage('Proyecto no válido');

const validarReportar = [
  body('motivo').isIn(MOTIVOS_REPORTE).withMessage(`El motivo debe ser: ${MOTIVOS_REPORTE.join(', ')}`),
  body('descripcion')
    .isString()
    .withMessage('Explica brevemente qué pasó')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('La descripción debe tener entre 3 y 500 caracteres'),
];

const validarListado = [filtroWorkspace];

const validarEstadisticas = [
  filtroWorkspace,
  query('anio').optional().isInt({ min: 2020, max: 2100 }).withMessage('Año no válido').toInt(),
];

module.exports = { validarReportar, validarListado, validarEstadisticas };
