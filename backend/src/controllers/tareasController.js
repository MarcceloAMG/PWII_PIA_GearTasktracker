const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/tareasService');

// POST /api/workspaces/:id/tareas
const crear = asyncHandler(async (req, res) =>
  exito(res, await servicio.crear(req.workspace, req.usuario, req.body), 201)
);

// GET /api/workspaces/:id/tareas?estado=&tablero=
const listarDelWorkspace = asyncHandler(async (req, res) =>
  exito(res, await servicio.listarDelWorkspace(req.workspace, req.query))
);

// POST /api/workspaces/:id/tareas/auto-asignar
const autoAsignar = asyncHandler(async (req, res) =>
  exito(res, await servicio.autoAsignar(req.usuario, req.workspace, req.body))
);

// GET /api/tareas/mias
const mias = asyncHandler(async (req, res) => exito(res, await servicio.listarMias(req.usuario._id)));

// PATCH /api/tareas/:id/asignar
const asignar = asyncHandler(async (req, res) => {
  const { usuarioId, fechaLimite } = req.body;
  return exito(res, await servicio.asignarManual(req.usuario, req.workspace, req.tarea, usuarioId, fechaLimite));
});

// PATCH /api/tareas/:id/tomar
const tomar = asyncHandler(async (req, res) =>
  exito(res, await servicio.tomarVoluntariamente(req.workspace, req.tarea, req.usuario))
);

// PATCH /api/tareas/:id/aprobar-excepcion
const aprobarExcepcion = asyncHandler(async (req, res) =>
  exito(res, await servicio.aprobarExcepcion(req.workspace, req.tarea))
);

// PATCH /api/tareas/:id/iniciar
const iniciar = asyncHandler(async (req, res) => exito(res, await servicio.iniciar(req.tarea, req.usuario)));

// PATCH /api/tareas/:id/completar
const completar = asyncHandler(async (req, res) =>
  exito(res, await servicio.completar(req.tarea, req.usuario))
);

// DELETE /api/tareas/:id
const cancelar = asyncHandler(async (req, res) => {
  await servicio.cancelar(req.tarea);
  return exito(res, { mensaje: 'Tarea cancelada' });
});

module.exports = {
  crear,
  listarDelWorkspace,
  autoAsignar,
  mias,
  asignar,
  tomar,
  aprobarExcepcion,
  iniciar,
  completar,
  cancelar,
};
