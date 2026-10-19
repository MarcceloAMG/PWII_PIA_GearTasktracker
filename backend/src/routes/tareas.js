const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const { cargarTarea, esMiembro, esAdminWorkspace } = require('../middlewares/workspace');
const c = require('../controllers/tareasController');
const v = require('../validators/tareas');
const reportes = require('../controllers/reportesController');
const vr = require('../validators/reportes');

router.use(auth);

// Debe ir antes de /:id para que "mias" no se tome como un id
router.get('/mias', c.mias);

router.patch('/:id/asignar', v.validarId, v.validarAsignarManual, validar, cargarTarea, esAdminWorkspace, c.asignar);
router.patch('/:id/tomar', v.validarId, validar, cargarTarea, esMiembro, c.tomar);
router.patch('/:id/aprobar-excepcion', v.validarId, validar, cargarTarea, esAdminWorkspace, c.aprobarExcepcion);
router.patch('/:id/iniciar', v.validarId, validar, cargarTarea, esMiembro, c.iniciar);
router.patch('/:id/completar', v.validarId, validar, cargarTarea, esMiembro, c.completar);
router.post('/:id/reportar', v.validarId, vr.validarReportar, validar, cargarTarea, esMiembro, reportes.reportar);
router.delete('/:id', v.validarId, validar, cargarTarea, esAdminWorkspace, c.cancelar);

module.exports = router;
