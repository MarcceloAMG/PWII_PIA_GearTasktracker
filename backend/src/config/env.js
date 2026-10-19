require('dotenv').config();

const requeridas = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`Faltan variables en el archivo .env: ${faltantes.join(', ')}`);
  console.error('Copia .env.example como .env y llena los valores.');
  process.exit(1);
}

module.exports = {
  puerto: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpira: process.env.JWT_EXPIRA || '8h',
};
