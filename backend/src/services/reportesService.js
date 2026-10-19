const Reporte = require('../models/Reporte');
const Tarea = require('../models/Tarea');
const Workspace = require('../models/Workspace');
const Notificacion = require('../models/Notificacion');
const ApiError = require('../utils/ApiError');
const { ESTADOS_ACTIVOS, MOTIVOS_REPORTE } = require('../config/constantes');

// El responsable avisa que no pudo cumplir la tarea. La tarea queda libre otra vez
// y el administrador recibe el reporte (y una notificación).
async function reportarTarea(tarea, workspace, usuario, { motivo, descripcion }) {
  if (!tarea.asignadoA || !tarea.asignadoA.equals(usuario._id)) {
    throw ApiError.prohibido('Solo quien tiene asignada la tarea puede reportarla');
  }
  if (!ESTADOS_ACTIVOS.includes(tarea.estado)) {
    throw ApiError.conflicto('Solo se pueden reportar tareas asignadas o en proceso');
  }

  const reporte = await Reporte.create({
    tarea: tarea._id,
    usuario: usuario._id,
    workspace: workspace._id,
    motivo,
    descripcion,
  });

  tarea.estado = 'disponible';
  tarea.asignadoA = null;
  tarea.tipoAsignacion = null;
  tarea.fechaLimite = null;
  await tarea.save();

  await Notificacion.create({
    destinatario: workspace.creador,
    tipo: 'reporte',
    mensaje: `${usuario.usuario} reportó "${tarea.titulo}" por ${motivo} (${workspace.titulo})`,
    workspace: workspace._id,
    origen: usuario._id,
  });

  return reporte;
}

// Proyectos que administra el usuario; si pide uno en concreto, debe ser de esos
async function proyectosAdministrados(idUsuario, idWorkspace) {
  const ids = await Workspace.find({ creador: idUsuario, activo: true }).distinct('_id');
  if (!idWorkspace) return ids;
  if (!ids.some((id) => id.equals(idWorkspace))) {
    throw ApiError.prohibido('Solo el administrador del proyecto ve sus reportes');
  }
  return [idWorkspace];
}

// Lista de reportes recibidos (disponible en plan básico y Premium)
async function listar(usuario, { workspace }) {
  const ids = await proyectosAdministrados(usuario._id, workspace);
  return Reporte.find({ workspace: { $in: ids } })
    .sort({ fecha: -1 })
    .limit(200)
    .populate('usuario', 'usuario foto')
    .populate('tarea', 'titulo')
    .populate('workspace', 'titulo codigo');
}

// Analítica de incidencias (Premium): reportes por motivo y por mes de un año
async function estadisticas(usuario, { workspace, anio }) {
  const year = anio || new Date().getFullYear();
  const ids = await proyectosAdministrados(usuario._id, workspace);
  const reportes = await Reporte.find({
    workspace: { $in: ids },
    fecha: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
  }).select('motivo fecha');

  const motivos = Object.fromEntries(MOTIVOS_REPORTE.map((m) => [m, Array(12).fill(0)]));
  reportes.forEach((r) => {
    motivos[r.motivo][r.fecha.getMonth()] += 1;
  });

  return { anio: year, total: reportes.length, motivos };
}

module.exports = { reportarTarea, listar, estadisticas };
