const { param, query } = require('express-validator');

const validarId = [param('id').isMongoId().withMessage('Id no válido')];

const validarFiltroLeida = [
  query('leida').optional().isIn(['true', 'false']).withMessage('El filtro "leida" debe ser true o false'),
];

module.exports = { validarId, validarFiltroLeida };
