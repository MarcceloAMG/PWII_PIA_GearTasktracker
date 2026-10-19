// Envuelve un controlador async para que cualquier error llegue al middleware de errores
// sin repetir try/catch en cada función.
const asyncHandler = (funcion) => (req, res, next) =>
  Promise.resolve(funcion(req, res, next)).catch(next);

module.exports = asyncHandler;
