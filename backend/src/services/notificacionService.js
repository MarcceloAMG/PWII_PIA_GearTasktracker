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

module.exports = { avisarCambioUsuario, avisarNuevosMiembros };
