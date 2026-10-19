const Workspace = require('../models/Workspace');
const Notificacion = require('../models/Notificacion');

// Cuando un usuario cambia su nombre de usuario o su contraseña, se avisa al administrador
// (creador) de cada workspace donde participa. Si todavía no está en ninguno, no hace nada.
async function avisarCambioUsuario(usuario, mensaje) {
  const workspaces = await Workspace.find({
    'miembros.usuario': usuario._id,
    creador: { $ne: usuario._id },
    activo: true,
  }).select('creador titulo');

  if (workspaces.length === 0) return;

  await Notificacion.insertMany(
    workspaces.map((workspace) => ({
      destinatario: workspace.creador,
      tipo: 'cambio_usuario',
      mensaje: `${mensaje} (${workspace.titulo})`,
      workspace: workspace._id,
      origen: usuario._id,
    }))
  );
}

// Avisa a quienes acaban de ser añadidos a un workspace
async function avisarNuevosMiembros(workspace, admin, usuarios) {
  if (usuarios.length === 0) return;

  await Notificacion.insertMany(
    usuarios.map((usuario) => ({
      destinatario: usuario._id,
      tipo: 'nuevo_miembro',
      mensaje: `${admin.usuario} te añadió al proyecto ${workspace.titulo}`,
      workspace: workspace._id,
      origen: admin._id,
    }))
  );
}

// Avisa a cada responsable que se le asignó una tarea: [{ usuarioId, tarea }]
async function avisarTareasAsignadas(workspace, admin, asignaciones) {
  if (asignaciones.length === 0) return;

  await Notificacion.insertMany(
    asignaciones.map(({ usuarioId, tarea }) => ({
      destinatario: usuarioId,
      tipo: 'tarea_asignada',
      mensaje: `Se te asignó la tarea "${tarea.titulo}" en ${workspace.titulo}`,
      workspace: workspace._id,
      origen: admin._id,
    }))
  );
}

// Avisa al administrador que una asignación superó el límite y espera su excepción
async function avisarLimbo(workspace, tarea, usuario) {
  await Notificacion.create({
    destinatario: workspace.creador,
    tipo: 'limbo',
    mensaje: `${usuario.usuario} superó su límite de tareas con "${tarea.titulo}" (${workspace.titulo}); requiere tu aprobación`,
    workspace: workspace._id,
    origen: usuario._id,
  });
}

module.exports = { avisarCambioUsuario, avisarNuevosMiembros, avisarTareasAsignadas, avisarLimbo };
