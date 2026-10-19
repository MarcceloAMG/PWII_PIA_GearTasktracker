const Tarea = require('../models/Tarea');
const Tablero = require('../models/Tablero');
const Usuario = require('../models/Usuario');
const ApiError = require('../utils/ApiError');
const { ESTADOS_ACTIVOS } = require('../config/constantes');
const {
  avisarTareasAsignadas,
  avisarLimbo,
} = require('./notificacionService');

const CAMPOS_USUARIO = 'usuario nombreCompleto foto rol';

const conResponsable = (consulta) => consulta.populate('asignadoA', CAMPOS_USUARIO);

const obtener = (id) => conResponsable(Tarea.findById(id));

// ---- Reglas de cupo -------------------------------------------------------

// Límite individual si el admin Premium lo definió; si no, el general del workspace
function limiteDe(workspace, idUsuario) {
  const miembro = workspace.miembros.find((m) => m.usuario.equals(idUsuario));
  return miembro && miembro.limiteTareas ? miembro.limiteTareas : workspace.limiteGeneral;
}

const contarActivas = (idWorkspace, idUsuario) =>
  Tarea.countDocuments({
    workspace: idWorkspace,
    asignadoA: idUsuario,
    estado: { $in: ESTADOS_ACTIVOS },
  });

// Rol con el que participa: el del equipo si lo definió, si no el de su perfil
const rolDe = (miembro, usuario) => miembro.rolEnEquipo || usuario.rol;

function exigirMiembro(workspace, idUsuario) {
  const miembro = workspace.miembros.find((m) => m.usuario.equals(idUsuario));
  if (!miembro) throw ApiError.badRequest('Ese usuario no pertenece al proyecto');
  return miembro;
}

// Deja la tarea asignada, o en limbo si el responsable ya llegó a su límite
async function asignarCon(tarea, workspace, usuario, tipoAsignacion, fechaLimite = null) {
  if (tarea.estado !== 'disponible') {
    throw ApiError.conflicto('La tarea ya no está disponible');
  }

  const excede = (await contarActivas(workspace._id, usuario._id)) >= limiteDe(workspace, usuario._id);

  tarea.asignadoA = usuario._id;
  tarea.tipoAsignacion = tipoAsignacion;
  tarea.estado = excede ? 'limbo' : 'asignada';
  if (fechaLimite) tarea.fechaLimite = fechaLimite;
  await tarea.save();

  if (excede) await avisarLimbo(workspace, tarea, usuario);
  return excede;
}

// ---- Alta y consulta ------------------------------------------------------

async function crear(workspace, admin, { titulo, descripcion, rolRequerido, tablero, fechaLimite }) {
  let idTablero = tablero;
  if (idTablero) {
    const existe = await Tablero.exists({ _id: idTablero, workspace: workspace._id, activo: true });
    if (!existe) throw ApiError.badRequest('El tablero no pertenece a este proyecto');
  } else {
    const primero = await Tablero.findOne({ workspace: workspace._id, activo: true }).sort({
      fechaCreacion: 1,
    });
    if (!primero) throw ApiError.badRequest('El proyecto no tiene tableros');
    idTablero = primero._id;
  }

  const tarea = await Tarea.create({
    tablero: idTablero,
    workspace: workspace._id,
    titulo,
    descripcion,
    rolRequerido,
    fechaLimite: fechaLimite || null,
    creadoPor: admin._id,
  });
  return obtener(tarea._id);
}

async function listarDelWorkspace(workspace, { estado, tablero }) {
  const filtro = { workspace: workspace._id, estado: { $ne: 'cancelada' } };
  if (estado) filtro.estado = estado;
  if (tablero) filtro.tablero = tablero;
  return conResponsable(Tarea.find(filtro).sort({ fechaCreacion: 1 }));
}

// Tareas que tiene el usuario en todos sus proyectos (para "Tareas asignadas a mí")
async function listarMias(idUsuario) {
  return Tarea.find({
    asignadoA: idUsuario,
    estado: { $in: [...ESTADOS_ACTIVOS, 'limbo'] },
  })
    .populate('workspace', 'titulo codigo')
    .sort({ fechaLimite: 1, fechaCreacion: 1 });
}

// ---- Asignación -----------------------------------------------------------

// Manual: el administrador elige a la persona y la fecha límite (cualquier rol)
async function asignarManual(admin, workspace, tarea, usuarioId, fechaLimite) {
  exigirMiembro(workspace, usuarioId);
  const usuario = await Usuario.findById(usuarioId).select(CAMPOS_USUARIO);

  const excede = await asignarCon(tarea, workspace, usuario, 'manual', fechaLimite);
  if (!excede) await avisarTareasAsignadas(workspace, admin, [{ usuarioId: usuario._id, tarea }]);
  return obtener(tarea._id);
}

// Voluntaria: cualquier integrante la toma si su rol coincide con el que pide la tarea
async function tomarVoluntariamente(workspace, tarea, usuario) {
  const miembro = exigirMiembro(workspace, usuario._id);
  if (rolDe(miembro, usuario) !== tarea.rolRequerido) {
    throw ApiError.prohibido(`Esta tarea requiere el rol ${tarea.rolRequerido}`);
  }
  await asignarCon(tarea, workspace, usuario, 'voluntaria');
  return obtener(tarea._id);
}

// Automática: reparte las tareas disponibles entre quienes tengan el rol y cupo libre,
// empezando por quien tiene menos tareas activas
async function autoAsignar(admin, workspace, { tablero } = {}) {
  await workspace.populate('miembros.usuario', CAMPOS_USUARIO);

  const filtro = { workspace: workspace._id, estado: 'disponible' };
  if (tablero) filtro.tablero = tablero;
  const pendientes = await Tarea.find(filtro).sort({ fechaCreacion: 1 });

  const ids = workspace.miembros.map((m) => m.usuario._id);
  const conteos = new Map(ids.map((id) => [id.toString(), 0]));
  const activas = await Tarea.aggregate([
    { $match: { workspace: workspace._id, asignadoA: { $in: ids }, estado: { $in: ESTADOS_ACTIVOS } } },
    { $group: { _id: '$asignadoA', total: { $sum: 1 } } },
  ]);
  activas.forEach((fila) => conteos.set(fila._id.toString(), fila.total));

  const asignadas = [];
  const sinCandidato = [];

  for (const tarea of pendientes) {
    const candidatos = workspace.miembros
      .filter((m) => rolDe(m, m.usuario) === tarea.rolRequerido)
      .filter((m) => conteos.get(m.usuario._id.toString()) < limiteDe(workspace, m.usuario._id))
      .sort((a, b) => conteos.get(a.usuario._id.toString()) - conteos.get(b.usuario._id.toString()));

    if (candidatos.length === 0) {
      sinCandidato.push(tarea._id);
      continue;
    }

    const elegido = candidatos[0].usuario._id;
    tarea.asignadoA = elegido;
    tarea.tipoAsignacion = 'automatica';
    tarea.estado = 'asignada';
    await tarea.save();
    conteos.set(elegido.toString(), conteos.get(elegido.toString()) + 1);
    asignadas.push({ usuarioId: elegido, tarea });
  }

  await avisarTareasAsignadas(workspace, admin, asignadas);
  return {
    asignadas: asignadas.length,
    sinCandidato: sinCandidato.length,
    tareas: await listarDelWorkspace(workspace, { tablero }),
  };
}

// El admin autoriza que la tarea en limbo cuente como excepción al límite
async function aprobarExcepcion(workspace, tarea) {
  if (tarea.estado !== 'limbo') throw ApiError.conflicto('La tarea no está en limbo');
  tarea.estado = 'pendiente_excepcion';
  tarea.tipoAsignacion = 'excepcion';
  await tarea.save();

  await avisarTareasAsignadas(workspace, { _id: workspace.creador }, [
    { usuarioId: tarea.asignadoA, tarea },
  ]);
  return obtener(tarea._id);
}

// ---- Avance ---------------------------------------------------------------

function exigirResponsable(tarea, usuario) {
  if (!tarea.asignadoA || !tarea.asignadoA.equals(usuario._id)) {
    throw ApiError.prohibido('Solo quien tiene asignada la tarea puede hacer esto');
  }
}

async function iniciar(tarea, usuario) {
  exigirResponsable(tarea, usuario);
  if (!['asignada', 'pendiente_excepcion'].includes(tarea.estado)) {
    throw ApiError.conflicto('La tarea no se puede iniciar en su estado actual');
  }
  tarea.estado = 'en_proceso';
  await tarea.save();
  return obtener(tarea._id);
}

async function completar(tarea, usuario) {
  exigirResponsable(tarea, usuario);
  if (!ESTADOS_ACTIVOS.includes(tarea.estado)) {
    throw ApiError.conflicto('La tarea no se puede completar en su estado actual');
  }
  tarea.estado = 'completada';
  tarea.fechaCompletada = new Date();
  await tarea.save();
  return obtener(tarea._id);
}

// Baja lógica: se conserva para el historial de productividad
async function cancelar(tarea) {
  if (tarea.estado === 'completada') throw ApiError.conflicto('Una tarea completada no se cancela');
  tarea.estado = 'cancelada';
  await tarea.save();
}

// Cuando alguien sale del proyecto, sus tareas sin terminar quedan libres otra vez
async function liberarTareasDe(idWorkspace, idUsuario) {
  await Tarea.updateMany(
    { workspace: idWorkspace, asignadoA: idUsuario, estado: { $in: [...ESTADOS_ACTIVOS, 'limbo'] } },
    { $set: { estado: 'disponible', asignadoA: null, tipoAsignacion: null } }
  );
}

module.exports = {
  crear,
  obtener,
  listarDelWorkspace,
  listarMias,
  asignarManual,
  tomarVoluntariamente,
  autoAsignar,
  aprobarExcepcion,
  iniciar,
  completar,
  cancelar,
  liberarTareasDe,
};
