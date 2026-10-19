const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const carpetaUploads = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(carpetaUploads, { recursive: true });

// La extensión sale del tipo de archivo, no del nombre que manda el navegador
const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

const almacenamiento = multer.diskStorage({
  destination: (_req, _archivo, cb) => cb(null, carpetaUploads),
  filename: (_req, archivo, cb) => {
    const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, nombre + EXTENSIONES[archivo.mimetype]);
  },
});

function soloImagenes(_req, archivo, cb) {
  if (EXTENSIONES[archivo.mimetype]) return cb(null, true);
  return cb(ApiError.badRequest('La foto debe ser una imagen JPG, PNG, WEBP o GIF'));
}

// Campo del formulario: "foto" (opcional)
const subirFoto = multer({
  storage: almacenamiento,
  fileFilter: soloImagenes,
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
}).single('foto');

module.exports = { subirFoto };
