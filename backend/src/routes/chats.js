const router = require('express').Router();
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const c = require('../controllers/chatsController');
const v = require('../validators/chats');

router.use(auth);

router.get('/', c.listar);
// "sin-leer" va antes de /:usuarioId para que no se tome como un id
router.get('/sin-leer', c.sinLeer);
router.get('/:usuarioId', v.validarConversacion, validar, c.conversacion);
router.post('/:usuarioId', v.validarEnviar, validar, c.enviar);

module.exports = router;
