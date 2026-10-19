const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { frontendDir } = require('./config/env');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errores');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Fotos de perfil subidas en el registro
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Revisión rápida de que el servidor responde
app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, data: { servicio: 'GearTask Tracker API', hora: new Date() } });
});

// Rutas de cada módulo, se montan conforme se construyen
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/tableros', require('./routes/tableros'));
app.use('/api/tareas', require('./routes/tareas'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/productividad', require('./routes/productividad'));
app.use('/api/chats', require('./routes/chats'));

app.use('/api', rutaNoEncontrada);

// Front end: Express sirve las pantallas (Html, Css, Js, Assets) desde el mismo servidor
if (frontendDir) {
  app.use(express.static(frontendDir));
  app.get('/', (_req, res) => res.redirect('/Html/PaginaPrincipal.html'));
} else {
  console.warn('No se encontró la carpeta del front. Define FRONTEND_DIR en el .env.');
}

app.use(manejarErrores);

module.exports = app;
