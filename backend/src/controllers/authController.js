const asyncHandler = require('../utils/asyncHandler');
const { creado, exito } = require('../utils/respuestas');
const { borrarArchivo } = require('../utils/archivos');
const authService = require('../services/authService');

// POST /api/auth/registro  (multipart con foto opcional, o JSON sin foto)
const registro = asyncHandler(async (req, res) => {
  try {
    const foto = req.file ? `/uploads/${req.file.filename}` : undefined;
    const datos = await authService.registrar({ ...req.body, foto });
    return creado(res, datos);
  } catch (error) {
    // Si el registro falla (usuario repetido, etc.) no dejamos la foto huérfana
    if (req.file) await borrarArchivo(req.file.path);
    throw error;
  }
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;
  const datos = await authService.iniciarSesion(correo, password);
  return exito(res, datos);
});

module.exports = { registro, login };
