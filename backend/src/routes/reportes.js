const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const requierePremium = require('../middlewares/premium');
const c = require('../controllers/reportesController');
const v = require('../validators/reportes');

router.use(auth);

router.get('/', v.validarListado, validar, c.listar);
router.get('/estadisticas', requierePremium, v.validarEstadisticas, validar, c.estadisticas);

module.exports = router;
