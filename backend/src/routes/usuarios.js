const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const {
  miPerfil,
  cambiarUsuario,
  cambiarPassword,
  buscarUsuarios,
} = require('../controllers/usuariosController');
const {
  validarCambioUsuario,
  validarCambioPassword,
  validarBusqueda,
} = require('../validators/usuarios');

// Todas las rutas de usuarios exigen sesión
router.use(auth);

router.get('/me', miPerfil);
router.patch('/me/usuario', validarCambioUsuario, validar, cambiarUsuario);
router.patch('/me/password', validarCambioPassword, validar, cambiarPassword);
router.get('/buscar', validarBusqueda, validar, buscarUsuarios);
// Sesión 6: PATCH /me/plan

module.exports = router;
