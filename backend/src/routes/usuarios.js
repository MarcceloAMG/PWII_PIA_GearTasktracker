const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const {
  miPerfil,
  cambiarUsuario,
  cambiarPassword,
  buscarUsuarios,
  cambiarPlan,
} = require('../controllers/usuariosController');
const {
  validarCambioUsuario,
  validarCambioPassword,
  validarBusqueda,
  validarCambioPlan,
} = require('../validators/usuarios');

// Todas las rutas de usuarios exigen sesión
router.use(auth);

router.get('/me', miPerfil);
router.patch('/me/usuario', validarCambioUsuario, validar, cambiarUsuario);
router.patch('/me/password', validarCambioPassword, validar, cambiarPassword);
router.get('/buscar', validarBusqueda, validar, buscarUsuarios);
router.patch('/me/plan', validarCambioPlan, validar, cambiarPlan);

module.exports = router;
