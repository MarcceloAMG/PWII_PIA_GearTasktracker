const { body, param } = require('express-validator');
const { ROLES } = require('../config/constantes');

const validarId = [param('id').isMongoId().withMessage('Id no válido')];
const validarUid = [param('uid').isMongoId().withMessage('Id de usuario no válido')];

const campoTitulo = body('titulo')
  .isString()
  .withMessage('El título es obligatorio')
  .trim()
  .isLength({ min: 3, max: 80 })
  .withMessage('El título debe tener entre 3 y 80 caracteres');

const campoDescripcion = body('descripcion')
  .isString()
  .withMessage('La descripción es obligatoria')
  .trim()
  .isLength({ min: 3, max: 500 })
  .withMessage('La descripción debe tener entre 3 y 500 caracteres');

const validarCrearWorkspace = [
  campoTitulo,
  campoDescripcion,
  body('miembros')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Los miembros deben ser una lista de máximo 30 usuarios'),
  body('miembros.*').isMongoId().withMessage('Alguno de los miembros tiene un id no válido'),
];

const validarActualizarWorkspace = [campoTitulo, campoDescripcion];

const validarLimite = [
  body('limiteGeneral')
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50')
    .toInt(),
];

const validarAgregarMiembro = [
  body('usuarioId').isMongoId().withMessage('Indica el id del usuario que quieres añadir'),
];

// rolEnEquipo lo cambia cada integrante en su propio perfil; limiteTareas solo el admin Premium
// (null quita el límite individual y vuelve al general). Los permisos se revisan en el servicio.
const validarModificarMiembro = [
  body('rolEnEquipo').optional().isIn(ROLES).withMessage('Rol no válido'),
  body('limiteTareas')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50')
    .toInt(),
];

const validarTablero = [
  body('nombre')
    .isString()
    .withMessage('El nombre del tablero es obligatorio')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre del tablero debe tener entre 2 y 80 caracteres'),
  body('descripcion')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La descripción del tablero no puede pasar de 300 caracteres'),
];

module.exports = {
  validarId,
  validarUid,
  validarCrearWorkspace,
  validarActualizarWorkspace,
  validarLimite,
  validarAgregarMiembro,
  validarModificarMiembro,
  validarTablero,
};
