const { body, param, query } = require('express-validator');
const { ROLES_TAREA, ESTADOS_TAREA } = require('../config/constantes');

const validarId = [param('id').isMongoId().withMessage('Id no válido')];

// La fecha límite debe ser una fecha futura (si es obligatoria, se avisa antes de validar el formato)
const fechaFutura = (campo, obligatoria = false) => {
  let cadena = body(campo);
  if (obligatoria) {
    cadena = cadena.exists({ values: 'falsy' }).withMessage('La fecha límite es obligatoria').bail();
  } else {
    cadena = cadena.optional({ values: 'falsy' });
  }
  return cadena
    .isISO8601()
    .withMessage('La fecha límite no es válida (usa AAAA-MM-DD)')
    .bail()
    .toDate()
    .custom((fecha) => fecha.getTime() > Date.now())
    .withMessage('La fecha límite debe ser posterior a hoy');
};

const validarCrearTarea = [
  body('titulo')
    .isString()
    .withMessage('El título es obligatorio')
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('El título debe tener entre 3 y 120 caracteres'),
  body('descripcion')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede pasar de 500 caracteres'),
  body('rolRequerido').isIn(ROLES_TAREA).withMessage('Selecciona un rol requerido válido'),
  body('tablero').optional({ values: 'falsy' }).isMongoId().withMessage('Tablero no válido'),
  fechaFutura('fechaLimite'),
];

// Asignación manual: el administrador elige responsable y fecha límite obligatoria
const validarAsignarManual = [
  body('usuarioId').isMongoId().withMessage('Indica el integrante al que asignas la tarea'),
  fechaFutura('fechaLimite', true),
];

const validarFiltros = [
  query('estado').optional().isIn(ESTADOS_TAREA).withMessage('Estado no válido'),
  query('tablero').optional().isMongoId().withMessage('Tablero no válido'),
];

module.exports = { validarId, validarCrearTarea, validarAsignarManual, validarFiltros };
