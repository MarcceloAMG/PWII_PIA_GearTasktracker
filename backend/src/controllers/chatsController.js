const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/chatsService');

// GET /api/chats
const listar = asyncHandler(async (req, res) =>
  exito(res, await servicio.listarConversaciones(req.usuario._id))
);

// GET /api/chats/sin-leer
const sinLeer = asyncHandler(async (req, res) =>
  exito(res, { total: await servicio.contarSinLeer(req.usuario._id) })
);

// GET /api/chats/:usuarioId?despues=
const conversacion = asyncHandler(async (req, res) =>
  exito(res, await servicio.obtenerConversacion(req.usuario._id, req.params.usuarioId, req.query))
);

// POST /api/chats/:usuarioId   { texto }
const enviar = asyncHandler(async (req, res) =>
  exito(res, await servicio.enviar(req.usuario._id, req.params.usuarioId, req.body.texto), 201)
);

module.exports = { listar, sinLeer, conversacion, enviar };
