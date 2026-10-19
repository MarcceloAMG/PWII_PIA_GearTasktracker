const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const { borrarArchivo } = require('../utils/archivos');

// Se pone después de las reglas de express-validator: si hay errores, responde 400
// con el primer mensaje de cada campo y descarta la foto que ya se hubiera guardado.
async function validar(req, _res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();

  if (req.file) await borrarArchivo(req.file.path);

  const mensaje = errores
    .array({ onlyFirstError: true })
    .map((e) => e.msg)
    .join('. ');
  return next(ApiError.badRequest(mensaje));
}

module.exports = validar;
