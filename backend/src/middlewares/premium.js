const { exigirPremium } = require('../utils/plan');

// Se pone en las rutas exclusivas de la versión Premium (después de auth)
function requierePremium(req, _res, next) {
  exigirPremium(req.usuario);
  next();
}

module.exports = requierePremium;
