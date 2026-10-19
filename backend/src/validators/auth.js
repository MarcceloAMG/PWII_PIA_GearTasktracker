const { body } = require('express-validator');
const { ROLES } = require('../config/constantes');

const aMinusculas = (valor) => String(valor ?? '').toLowerCase();

const validarRegistro = [
  body('nombreCompleto')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .isLength({ min: 3, max: 80 })
    .withMessage('El nombre completo debe tener entre 3 y 80 caracteres'),
  body('usuario')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .matches(/^[A-Za-z0-9_.-]{3,30}$/)
    .withMessage('El usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -'),
  body('correo')
    .trim()
    .customSanitizer(aMinusculas)
    .isEmail()
    .withMessage('El correo no tiene un formato válido'),
  body('password')
    .isString()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 72 })
    .withMessage('La contraseña debe tener entre 6 y 72 caracteres'),
  body('telefono')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener 10 dígitos'),
  body('rol').optional({ values: 'falsy' }).isIn(ROLES).withMessage('Rol no válido'),
];

const validarLogin = [
  body('correo')
    .trim()
    .customSanitizer(aMinusculas)
    .isEmail()
    .withMessage('Escribe un correo válido'),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { validarRegistro, validarLogin };
