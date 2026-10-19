const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const { cargarWorkspace, esMiembro, esAdminWorkspace } = require('../middlewares/workspace');
const c = require('../controllers/workspacesController');
const v = require('../validators/workspaces');
const t = require('../controllers/tareasController');
const vt = require('../validators/tareas');

router.use(auth);

router.get('/', c.listar);
router.post('/', v.validarCrearWorkspace, validar, c.crear);

// Todo lo que cuelga de /:id valida el id y carga el workspace; después cada ruta pide su rol
router.get('/:id', v.validarId, validar, cargarWorkspace, esMiembro, c.detalle);
router.put('/:id', v.validarId, v.validarActualizarWorkspace, validar, cargarWorkspace, esAdminWorkspace, c.actualizar);
router.delete('/:id', v.validarId, validar, cargarWorkspace, esAdminWorkspace, c.eliminar);
router.patch('/:id/limite', v.validarId, v.validarLimite, validar, cargarWorkspace, esAdminWorkspace, c.cambiarLimite);

// Equipo
router.post('/:id/miembros', v.validarId, v.validarAgregarMiembro, validar, cargarWorkspace, esAdminWorkspace, c.agregarMiembro);
router.patch('/:id/miembros/:uid', v.validarId, v.validarUid, v.validarModificarMiembro, validar, cargarWorkspace, esMiembro, c.modificarMiembro);
router.delete('/:id/miembros/:uid', v.validarId, v.validarUid, validar, cargarWorkspace, esMiembro, c.quitarMiembro);

// Tableros del proyecto
router.get('/:id/tableros', v.validarId, validar, cargarWorkspace, esMiembro, c.listarTableros);
router.post('/:id/tableros', v.validarId, v.validarTablero, validar, cargarWorkspace, esAdminWorkspace, c.crearTablero);

// Tareas del proyecto
router.get('/:id/tareas', v.validarId, vt.validarFiltros, validar, cargarWorkspace, esMiembro, t.listarDelWorkspace);
router.post('/:id/tareas', v.validarId, vt.validarCrearTarea, validar, cargarWorkspace, esAdminWorkspace, t.crear);
router.post('/:id/tareas/auto-asignar', v.validarId, validar, cargarWorkspace, esAdminWorkspace, t.autoAsignar);

module.exports = router;
