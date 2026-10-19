const router = require('express').Router();
const auth = require('../middlewares/auth');
const { miPerfil } = require('../controllers/usuariosController');

// Todas las rutas de usuarios exigen sesión
router.use(auth);

router.get('/me', miPerfil);
// Sesión 3: PATCH /me/usuario, PATCH /me/password, GET /buscar...

module.exports = router;
