const router = require('express').Router();
const { registro, login } = require('../controllers/authController');
const { subirFoto } = require('../middlewares/upload');
const validar = require('../middlewares/validar');
const { validarRegistro, validarLogin } = require('../validators/auth');

// Orden: leer foto → reglas de validación → revisar errores → controlador
router.post('/registro', subirFoto, validarRegistro, validar, registro);
router.post('/login', validarLogin, validar, login);

module.exports = router;
