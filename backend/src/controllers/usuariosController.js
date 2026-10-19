const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { exito } = require('../utils/respuestas');
const usuariosService = require('../services/usuariosService');

// GET /api/usuarios/me  (el middleware auth ya cargó al usuario en req.usuario)
const miPerfil = (req, res) => exito(res, req.usuario);

// PATCH /api/usuarios/me/usuario
const cambiarUsuario = asyncHandler(async (req, res) => {
  const usuario = await usuariosService.cambiarUsuario(req.usuario, req.body.usuario);
  return exito(res, usuario);
});

// PATCH /api/usuarios/me/password
const cambiarPassword = asyncHandler(async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;
  await usuariosService.cambiarPassword(req.usuario.id, passwordActual, passwordNueva);
  return exito(res, { mensaje: 'Contraseña actualizada' });
});

// GET /api/usuarios/buscar?usuario=ana   o   ?telefono=8112345678
const buscarUsuarios = asyncHandler(async (req, res) => {
  const { usuario, telefono } = req.query;
  if (!usuario && !telefono) {
    throw ApiError.badRequest('Indica un usuario o un teléfono para buscar');
  }
  const encontrados = await usuariosService.buscar({ usuario, telefono }, req.usuario.id);
  return exito(res, encontrados);
});

module.exports = { miPerfil, cambiarUsuario, cambiarPassword, buscarUsuarios };
