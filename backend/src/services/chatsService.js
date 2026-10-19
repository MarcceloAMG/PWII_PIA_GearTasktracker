const Mensaje = require('../models/Mensaje');
const Usuario = require('../models/Usuario');
const ApiError = require('../utils/ApiError');

const CAMPOS_PUBLICOS = 'usuario nombreCompleto rol foto';

async function exigirDestinatario(idYo, idOtro) {
  if (idYo.equals(idOtro)) throw ApiError.badRequest('No puedes chatear contigo mismo');
  const otro = await Usuario.findById(idOtro).select(CAMPOS_PUBLICOS);
  if (!otro) throw ApiError.noEncontrado('El usuario no existe');
  return otro;
}

// Una fila por persona con la que hay conversación: último mensaje y cuántos faltan por leer
async function listarConversaciones(idYo) {
  const filas = await Mensaje.aggregate([
    { $match: { $or: [{ de: idYo }, { para: idYo }] } },
    { $sort: { fecha: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ['$de', idYo] }, '$para', '$de'] },
        ultimoMensaje: { $first: '$texto' },
        fecha: { $first: '$fecha' },
        sinLeer: {
          $sum: { $cond: [{ $and: [{ $eq: ['$para', idYo] }, { $eq: ['$leido', false] }] }, 1, 0] },
        },
      },
    },
    { $sort: { fecha: -1 } },
  ]);

  const usuarios = await Usuario.find({ _id: { $in: filas.map((f) => f._id) } }).select(CAMPOS_PUBLICOS);
  const porId = new Map(usuarios.map((u) => [u.id, u]));

  return filas
    .filter((fila) => porId.has(fila._id.toString()))
    .map((fila) => ({
      usuario: porId.get(fila._id.toString()),
      ultimoMensaje: fila.ultimoMensaje,
      fecha: fila.fecha,
      sinLeer: fila.sinLeer,
    }));
}

// Mensajes entre los dos (del más viejo al más nuevo). Lo que recibí queda como leído.
async function obtenerConversacion(idYo, idOtro, { despues } = {}) {
  const otro = await exigirDestinatario(idYo, idOtro);

  const filtro = {
    $or: [
      { de: idYo, para: idOtro },
      { de: idOtro, para: idYo },
    ],
  };
  if (despues) filtro.fecha = { $gt: despues };

  const mensajes = await Mensaje.find(filtro).sort({ fecha: 1 }).limit(500);
  await Mensaje.updateMany({ de: idOtro, para: idYo, leido: false }, { $set: { leido: true } });

  return { usuario: otro, mensajes };
}

async function enviar(idYo, idOtro, texto) {
  await exigirDestinatario(idYo, idOtro);
  return Mensaje.create({ de: idYo, para: idOtro, texto });
}

// Cuántos mensajes tengo sin leer (para el globo de la pantalla principal)
const contarSinLeer = (idYo) => Mensaje.countDocuments({ para: idYo, leido: false });

module.exports = { listarConversaciones, obtenerConversacion, enviar, contarSinLeer };
