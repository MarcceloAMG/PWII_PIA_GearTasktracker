const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/reportesService');

// POST /api/tareas/:id/reportar
const reportar = asyncHandler(async (req, res) =>
  exito(res, await servicio.reportarTarea(req.tarea, req.workspace, req.usuario, req.body), 201)
);

// GET /api/reportes?workspace=
const listar = asyncHandler(async (req, res) => exito(res, await servicio.listar(req.usuario, req.query)));

// GET /api/reportes/estadisticas?workspace=&anio=   (Premium)
const estadisticas = asyncHandler(async (req, res) =>
  exito(res, await servicio.estadisticas(req.usuario, req.query))
);

module.exports = { reportar, listar, estadisticas };
