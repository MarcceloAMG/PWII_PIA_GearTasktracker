const ApiError = require('./ApiError');

// Las funciones de la versión de paga lanzan 403 si el usuario tiene el plan básico
function exigirPremium(usuario, mensaje = 'Esta función es exclusiva de la versión Premium') {
  if (usuario.plan !== 'premium') {
    throw ApiError.prohibido(mensaje);
  }
}

module.exports = { exigirPremium };
