const fs = require('fs');
const path = require('path');
require('dotenv').config();

const requeridas = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`Faltan variables en el archivo .env: ${faltantes.join(', ')}`);
  console.error('Copia .env.example como .env y llena los valores.');
  process.exit(1);
}

// Carpeta del front end que Express sirve como archivos estáticos.
// Se toma FRONTEND_DIR del .env; si no existe, se busca junto a backend/.
const raizRepo = path.join(__dirname, '..', '..', '..');
const candidatos = [
  process.env.FRONTEND_DIR,
  path.join(raizRepo, 'frontend'),
  path.join(raizRepo, 'PWII_PIA_GearTasktracker'),
]
  .filter(Boolean)
  .map((ruta) => path.resolve(ruta));

const frontendDir = candidatos.find((ruta) => fs.existsSync(path.join(ruta, 'Html'))) || null;

module.exports = {
  puerto: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpira: process.env.JWT_EXPIRA || '8h',
  frontendDir,
};
