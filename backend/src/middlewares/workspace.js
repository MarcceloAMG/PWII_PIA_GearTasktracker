const Workspace = require('../models/Workspace');
const Tablero = require('../models/Tablero');
const Tarea = require('../models/Tarea');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Carga el workspace de :id (solo si no está dado de baja) y lo deja en req.workspace
const cargarWorkspace = asyncHandler(async (req, _res, next) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, activo: true });
  if (!workspace) throw ApiError.noEncontrado('El proyecto no existe');
  req.workspace = workspace;
  next();
});

// Para rutas /tableros/:id: carga el tablero y también su workspace
const cargarTablero = asyncHandler(async (req, _res, next) => {
  const tablero = await Tablero.findOne({ _id: req.params.id, activo: true });
  if (!tablero) throw ApiError.noEncontrado('El tablero no existe');

  const workspace = await Workspace.findOne({ _id: tablero.workspace, activo: true });
  if (!workspace) throw ApiError.noEncontrado('El proyecto de este tablero ya no existe');

  req.tablero = tablero;
  req.workspace = workspace;
  next();
});

// Para rutas /tareas/:id: carga la tarea y el workspace al que pertenece
const cargarTarea = asyncHandler(async (req, _res, next) => {
  const tarea = await Tarea.findById(req.params.id);
  if (!tarea) throw ApiError.noEncontrado('La tarea no existe');

  const workspace = await Workspace.findOne({ _id: tarea.workspace, activo: true });
  if (!workspace) throw ApiError.noEncontrado('El proyecto de esta tarea ya no existe');

  req.tarea = tarea;
  req.workspace = workspace;
  next();
});

// Pertenecer al equipo del workspace
function esMiembro(req, _res, next) {
  const pertenece = req.workspace.miembros.some((miembro) => miembro.usuario.equals(req.usuario._id));
  if (!pertenece) throw ApiError.prohibido('No perteneces a este proyecto');
  next();
}

// Ser el administrador (creador) del workspace
function esAdminWorkspace(req, _res, next) {
  if (!req.workspace.creador.equals(req.usuario._id)) {
    throw ApiError.prohibido('Solo el administrador del proyecto puede hacer esto');
  }
  next();
}

module.exports = { cargarWorkspace, cargarTablero, cargarTarea, esMiembro, esAdminWorkspace };
