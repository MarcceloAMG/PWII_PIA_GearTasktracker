const { exito } = require('../utils/respuestas');

// GET /api/usuarios/me  (el middleware auth ya cargó al usuario en req.usuario)
const miPerfil = (req, res) => exito(res, req.usuario);

module.exports = { miPerfil };
