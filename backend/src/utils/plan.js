const ApiError = require('./ApiError');

// Las funciones de la versión de paga lanzan 403 si el usuario tiene el plan básico
function exigirPremium(usuario) {
  if (usuario.plan !== 'premium') {
    throw ApiError.prohibido('Esta función es exclusiva de la versión Premium');
  }
}

module.exports = { exigirPremium };
