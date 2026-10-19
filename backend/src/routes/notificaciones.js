const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const c = require('../controllers/notificacionesController');
const v = require('../validators/notificaciones');

router.use(auth);

router.get('/', v.validarFiltroLeida, validar, c.listar);
// "leidas" va antes de /:id para que no se tome como un id
router.patch('/leidas', c.marcarTodas);
router.patch('/:id/leida', v.validarId, validar, c.marcarLeida);

module.exports = router;
