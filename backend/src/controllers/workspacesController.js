const asyncHandler = require('../utils/asyncHandler');
const { exito } = require('../utils/respuestas');
const servicio = require('../services/workspacesService');

// GET /api/workspaces
const listar = asyncHandler(async (req, res) => exito(res, await servicio.listarDelUsuario(req.usuario._id)));

// POST /api/workspaces
const crear = asyncHandler(async (req, res) => {
  const workspace = await servicio.crear(req.usuario, req.body);
  return exito(res, workspace, 201);
});

// GET /api/workspaces/:id  (workspace ya cargado por el middleware)
const detalle = asyncHandler(async (req, res) => exito(res, await servicio.obtener(req.workspace._id)));

// PUT /api/workspaces/:id
const actualizar = asyncHandler(async (req, res) =>
  exito(res, await servicio.actualizar(req.workspace, req.body))
);

// DELETE /api/workspaces/:id
const eliminar = asyncHandler(async (req, res) => {
  await servicio.eliminar(req.workspace);
  return exito(res, { mensaje: 'Proyecto eliminado' });
});

// PATCH /api/workspaces/:id/limite
const cambiarLimite = asyncHandler(async (req, res) =>
  exito(res, await servicio.cambiarLimiteGeneral(req.usuario, req.workspace, req.body.limiteGeneral))
);

// POST /api/workspaces/:id/miembros
const agregarMiembro = asyncHandler(async (req, res) =>
  exito(res, await servicio.agregarMiembro(req.usuario, req.workspace, req.body.usuarioId), 201)
);

// PATCH /api/workspaces/:id/miembros/:uid
const modificarMiembro = asyncHandler(async (req, res) =>
  exito(res, await servicio.modificarMiembro(req.usuario, req.workspace, req.params.uid, req.body))
);

// DELETE /api/workspaces/:id/miembros/:uid
const quitarMiembro = asyncHandler(async (req, res) =>
  exito(res, await servicio.quitarMiembro(req.usuario, req.workspace, req.params.uid))
);

// GET /api/workspaces/:id/tableros
const listarTableros = asyncHandler(async (req, res) =>
  exito(res, await servicio.listarTableros(req.workspace._id))
);

// POST /api/workspaces/:id/tableros
const crearTablero = asyncHandler(async (req, res) =>
  exito(res, await servicio.crearTablero(req.workspace, req.body), 201)
);

// PUT /api/tableros/:id
const actualizarTablero = asyncHandler(async (req, res) =>
  exito(res, await servicio.actualizarTablero(req.tablero, req.body))
);

// DELETE /api/tableros/:id
const eliminarTablero = asyncHandler(async (req, res) => {
  await servicio.eliminarTablero(req.tablero);
  return exito(res, { mensaje: 'Tablero eliminado' });
});

module.exports = {
  listar,
  crear,
  detalle,
  actualizar,
  eliminar,
  cambiarLimite,
  agregarMiembro,
  modificarMiembro,
  quitarMiembro,
  listarTableros,
  crearTablero,
  actualizarTablero,
  eliminarTablero,
};
