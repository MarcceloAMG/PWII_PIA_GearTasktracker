const Usuario = require('../models/Usuario');
const Workspace = require('../models/Workspace');
const { LIMITE_TAREAS_BASICO } = require('../config/constantes');
const ApiError = require('../utils/ApiError');
const { avisarCambioUsuario } = require('./notificacionService');

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Cambia el nombre de usuario de quien tiene la sesión (usuario ya cargado por el middleware auth)
async function cambiarUsuario(usuario, nuevoUsuario) {
  if (nuevoUsuario === usuario.usuario) {
    throw ApiError.badRequest('Ese ya es tu nombre de usuario');
  }
  if (await Usuario.exists({ usuario: nuevoUsuario })) {
    throw ApiError.conflicto('Ese nombre de usuario ya está en uso');
  }

  const anterior = usuario.usuario;
  usuario.usuario = nuevoUsuario;
  await usuario.save();

  await avisarCambioUsuario(usuario, `${anterior} cambió su nombre de usuario a ${nuevoUsuario}`);
  return usuario;
}

async function cambiarPassword(idUsuario, passwordActual, passwordNueva) {
  const usuario = await Usuario.findById(idUsuario).select('+password');

  // 400 y no 401: un 401 haría que el front cierre la sesión por una contraseña mal escrita
  if (!(await usuario.compararPassword(passwordActual))) {
    throw ApiError.badRequest('La contraseña actual es incorrecta');
  }
  if (passwordActual === passwordNueva) {
    throw ApiError.badRequest('La nueva contraseña debe ser distinta a la actual');
  }

  usuario.password = passwordNueva; // el modelo la encripta al guardar
  await usuario.save();

  await avisarCambioUsuario(usuario, `${usuario.usuario} cambió su contraseña`);
}

// Búsqueda exacta por usuario (sin importar mayúsculas) o por teléfono, para añadir
// integrantes y abrir chats. Solo devuelve datos públicos y nunca al propio usuario.
async function buscar({ usuario, telefono }, idActual) {
  const filtro = usuario
    ? { usuario: new RegExp(`^${escaparRegex(usuario)}$`, 'i') }
    : { telefono };

  return Usuario.find({ ...filtro, _id: { $ne: idActual } })
    .select('usuario nombreCompleto rol foto')
    .limit(10);
}

// Cambia entre plan básico y Premium (el pago es simulado, como en la pantalla del front).
// Al volver a básico, los límites personalizados de sus proyectos regresan al fijo de 3.
async function cambiarPlan(usuario, plan) {
  if (usuario.plan === plan) return usuario;

  usuario.plan = plan;
  await usuario.save();

  if (plan === 'basico') {
    await Workspace.updateMany(
      { creador: usuario._id },
      { $set: { limiteGeneral: LIMITE_TAREAS_BASICO, 'miembros.$[].limiteTareas': null } }
    );
  }
  return usuario;
}

module.exports = { cambiarUsuario, cambiarPassword, buscar, cambiarPlan };
