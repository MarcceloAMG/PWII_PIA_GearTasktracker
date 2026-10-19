const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/notificacionesService');

// GET /api/notificaciones?leida=false
const listar = asyncHandler(async (req, res) =>
  exito(res, await servicio.listar(req.usuario._id, req.query))
);

// PATCH /api/notificaciones/:id/leida
const marcarLeida = asyncHandler(async (req, res) =>
  exito(res, await servicio.marcarLeida(req.params.id, req.usuario._id))
);

// PATCH /api/notificaciones/leidas
const marcarTodas = asyncHandler(async (req, res) =>
  exito(res, await servicio.marcarTodasLeidas(req.usuario._id))
);

module.exports = { listar, marcarLeida, marcarTodas };
