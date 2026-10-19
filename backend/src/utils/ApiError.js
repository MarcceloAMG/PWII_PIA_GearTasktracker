// Error con código HTTP; el middleware de errores lo convierte en respuesta JSON.
class ApiError extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
    this.name = 'ApiError';
  }

  static badRequest(mensaje = 'Datos inválidos') {
    return new ApiError(400, mensaje);
  }

  static noAutenticado(mensaje = 'Sesión no válida o expirada') {
    return new ApiError(401, mensaje);
  }

  static prohibido(mensaje = 'No tienes permiso para realizar esta acción') {
    return new ApiError(403, mensaje);
  }

  static noEncontrado(mensaje = 'Recurso no encontrado') {
    return new ApiError(404, mensaje);
  }

  static conflicto(mensaje = 'El recurso ya existe o hay un conflicto') {
    return new ApiError(409, mensaje);
  }
}

module.exports = ApiError;
