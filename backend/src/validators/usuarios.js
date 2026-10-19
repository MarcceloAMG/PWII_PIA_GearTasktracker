const { body, query } = require('express-validator');

const validarCambioUsuario = [
  body('usuario')
    .isString()
    .withMessage('El nuevo nombre de usuario es obligatorio')
    .trim()
    .matches(/^[A-Za-z0-9_.-]{3,30}$/)
    .withMessage('El usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -'),
];

const validarCambioPassword = [
  body('passwordActual').isString().notEmpty().withMessage('Escribe tu contraseña actual'),
  body('passwordNueva')
    .isString()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6, max: 72 })
    .withMessage('La nueva contraseña debe tener entre 6 y 72 caracteres'),
];

// Se busca por usuario O por teléfono (uno de los dos); el controlador revisa que venga alguno
const validarBusqueda = [
  query('usuario')
    .optional()
    .isString()
    .withMessage('Usuario no válido')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('El usuario a buscar debe tener entre 1 y 30 caracteres'),
  query('telefono')
    .optional()
    .isString()
    .withMessage('Teléfono no válido')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener 10 dígitos'),
];

module.exports = { validarCambioUsuario, validarCambioPassword, validarBusqueda };
