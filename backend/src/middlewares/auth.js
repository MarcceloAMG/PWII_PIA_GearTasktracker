const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

// Protege una ruta: exige "Authorization: Bearer <token>", valida el JWT y deja
// al usuario completo en req.usuario. Se consulta la base en cada petición para que
// un cambio de plan o una baja de cuenta se note de inmediato.
const auth = asyncHandler(async (req, _res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw ApiError.noAutenticado('Falta el token de sesión');
  }

  // Si el token es falso o expiró, jwt.verify lanza un error que el middleware
  // de errores convierte en 401.
  const { id } = jwt.verify(token, jwtSecret);

  const usuario = await Usuario.findById(id);
  if (!usuario) throw ApiError.noAutenticado('El usuario de esta sesión ya no existe');

  req.usuario = usuario;
  next();
});

module.exports = auth;
