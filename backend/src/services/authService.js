const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpira } = require('../config/env');

function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, usuario: usuario.usuario, plan: usuario.plan }, jwtSecret, {
    expiresIn: jwtExpira,
  });
}

// Solo se toman los campos permitidos: así nadie puede registrarse con plan "premium"
// mandando campos extra en la petición.
async function registrar({ nombreCompleto, usuario, correo, password, telefono, rol, foto }) {
  const existente = await Usuario.findOne({
    $or: [{ usuario }, { correo }, { telefono }],
  }).select('usuario correo telefono');

  if (existente) {
    if (existente.usuario === usuario) throw ApiError.conflicto('Ese nombre de usuario ya está en uso');
    if (existente.correo === correo) throw ApiError.conflicto('Ese correo ya está registrado');
    throw ApiError.conflicto('Ese teléfono ya está registrado');
  }

  // La contraseña se encripta en el modelo (pre-save)
  const nuevo = await Usuario.create({ nombreCompleto, usuario, correo, password, telefono, rol, foto });
  return { usuario: nuevo, token: generarToken(nuevo) };
}

async function iniciarSesion(correo, password) {
  const usuario = await Usuario.findOne({ correo }).select('+password');

  // Mismo mensaje si falla el correo o la contraseña, para no revelar qué correos existen
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw ApiError.noAutenticado('Correo o contraseña incorrectos');
  }

  return { usuario, token: generarToken(usuario) };
}

module.exports = { registrar, iniciarSesion };
