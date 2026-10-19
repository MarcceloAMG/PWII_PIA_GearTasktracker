const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/productividadService');

// GET /api/productividad?anio=2026&mes=10   (sin parámetros = mes actual)
const delMes = asyncHandler(async (req, res) => exito(res, await servicio.delMes(req.usuario, req.query)));

module.exports = { delMes };
