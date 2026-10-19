const { body, param, query } = require('express-validator');

const validarUsuarioId = [param('usuarioId').isMongoId().withMessage('Id de usuario no válido')];

const validarEnviar = [
  ...validarUsuarioId,
  body('texto')
    .isString()
    .withMessage('El mensaje es obligatorio')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
];

// "despues" sirve para pedir solo los mensajes nuevos (el front consulta cada pocos segundos)
const validarConversacion = [
  ...validarUsuarioId,
  query('despues').optional().isISO8601().withMessage('La fecha "despues" no es válida').toDate(),
];

module.exports = { validarEnviar, validarConversacion };
