const Notificacion = require('../models/Notificacion');
const ApiError = require('../utils/ApiError');

// Las notificaciones se crean desde otros servicios (nuevo miembro, cambio de usuario, limbo...).
// Aquí solo se consultan y se marcan como leídas; su contenido nunca se modifica.
async function listar(idUsuario, { leida } = {}) {
  const filtro = { destinatario: idUsuario };
  if (leida !== undefined) filtro.leida = leida === 'true';

  return Notificacion.find(filtro)
    .sort({ fecha: -1 })
    .limit(100)
    .populate('origen', 'usuario foto')
    .populate('workspace', 'titulo codigo');
}

async function marcarLeida(idNotificacion, idUsuario) {
  // Se busca con el destinatario: nadie puede tocar notificaciones ajenas
  const notificacion = await Notificacion.findOne({ _id: idNotificacion, destinatario: idUsuario });
  if (!notificacion) throw ApiError.noEncontrado('La notificación no existe');

  notificacion.leida = true;
  await notificacion.save();
  return notificacion.populate([
    { path: 'origen', select: 'usuario foto' },
    { path: 'workspace', select: 'titulo codigo' },
  ]);
}

async function marcarTodasLeidas(idUsuario) {
  const resultado = await Notificacion.updateMany(
    { destinatario: idUsuario, leida: false },
    { $set: { leida: true } }
  );
  return { actualizadas: resultado.modifiedCount };
}

module.exports = { listar, marcarLeida, marcarTodasLeidas };
