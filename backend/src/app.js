const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

// Las rutas de cada módulo se montan aquí conforme se construyen:
// app.use('/api/auth', require('./routes/auth'));            (Sesión 2)
// app.use('/api/usuarios', require('./routes/usuarios'));    (Sesión 3)
// app.use('/api/workspaces', require('./routes/workspaces')); (Sesión 4)
// app.use('/api/tareas', require('./routes/tareas'));        (Sesión 5)

app.use('/api', rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
