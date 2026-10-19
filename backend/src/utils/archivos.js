const fs = require('fs/promises');

// Borra un archivo subido (por ejemplo, si el registro falla después de guardar la foto).
// Si ya no existe no pasa nada.
async function borrarArchivo(ruta) {
  try {
    await fs.unlink(ruta);
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('No se pudo borrar el archivo:', ruta);
  }
}

module.exports = { borrarArchivo };
