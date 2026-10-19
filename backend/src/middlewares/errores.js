const ApiError = require('../utils/ApiError');

// Rutas /api que no existen
function rutaNoEncontrada(req, _res, next) {
  next(ApiError.noEncontrado(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Convierte cualquier error en { ok: false, mensaje } con su código HTTP
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, _req, res, _next) {
  let codigo = error.codigo || 500;
  let mensaje = error.message || 'Error interno del servidor';

  if (error.name === 'ValidationError') {
    // Error de validación de Mongoose
    codigo = 400;
    mensaje = Object.values(error.errors)
      .map((e) => e.message)
      .join('. ');
  } else if (error.code === 11000) {
    // Índice único duplicado (usuario, correo, teléfono...)
    codigo = 409;
    const campo = Object.keys(error.keyPattern || {})[0] || 'valor';
    mensaje = `Ya existe un registro con ese ${campo}`;
  } else if (error.name === 'CastError') {
    // Id de MongoDB mal formado
    codigo = 400;
    mensaje = `Valor inválido para ${error.path}`;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    codigo = 401;
    mensaje = 'Sesión no válida o expirada';
  } else if (error.name === 'MulterError') {
    codigo = 400;
    mensaje =
      error.code === 'LIMIT_FILE_SIZE' ? 'La foto no puede pasar de 2 MB' : error.message;
  }

  if (codigo >= 500) console.error(error);

  res.status(codigo).json({ ok: false, mensaje });
}

module.exports = { rutaNoEncontrada, manejarErrores };
