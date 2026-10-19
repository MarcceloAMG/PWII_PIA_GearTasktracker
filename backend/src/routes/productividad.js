const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const c = require('../controllers/productividadController');
const { validarMes } = require('../validators/productividad');

router.use(auth);

router.get('/', validarMes, validar, c.delMes);

module.exports = router;
