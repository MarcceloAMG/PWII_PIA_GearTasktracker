const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const { cargarTablero, esAdminWorkspace } = require('../middlewares/workspace');
const c = require('../controllers/workspacesController');
const v = require('../validators/workspaces');

router.use(auth);

router.put('/:id', v.validarId, v.validarTablero, validar, cargarTablero, esAdminWorkspace, c.actualizarTablero);
router.delete('/:id', v.validarId, validar, cargarTablero, esAdminWorkspace, c.eliminarTablero);

module.exports = router;
