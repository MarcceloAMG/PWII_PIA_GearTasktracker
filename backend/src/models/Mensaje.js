const mongoose = require('mongoose');

// Chat privado 1 a 1 entre integrantes
const mensajeSchema = new mongoose.Schema(
  {
    de: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    para: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    texto: {
      type: String,
      required: [true, 'El mensaje no puede estar vacío'],
      trim: true,
      maxlength: [1000, 'El mensaje no puede pasar de 1000 caracteres'],
    },
    leido: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'fecha', updatedAt: false } }
);

mensajeSchema.index({ de: 1, para: 1, fecha: 1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);
