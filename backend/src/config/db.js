const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function conectarDB() {
  try {
    await mongoose.connect(mongoUri);
    console.info(`MongoDB conectado: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = conectarDB;
