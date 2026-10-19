const { puerto } = require('./src/config/env');
const conectarDB = require('./src/config/db');
const app = require('./src/app');

async function iniciar() {
  await conectarDB();
  app.listen(puerto, () => {
    console.info(`Servidor listo en http://localhost:${puerto}`);
  });
}

iniciar();
