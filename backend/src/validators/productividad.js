const { query } = require('express-validator');

const validarMes = [
  query('anio').optional().isInt({ min: 2020, max: 2100 }).withMessage('Año no válido').toInt(),
  query('mes').optional().isInt({ min: 1, max: 12 }).withMessage('El mes debe ser de 1 a 12').toInt(),
];

module.exports = { validarMes };
