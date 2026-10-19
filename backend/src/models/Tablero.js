const mongoose = require('mongoose');

const tableroSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    nombre: {
      type: String,
      required: [true, 'El nombre del tablero es obligatorio'],
      trim: true,
      maxlength: [80, 'El nombre no puede pasar de 80 caracteres'],
    },
    descripcion: { type: String, trim: true, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

tableroSchema.index({ workspace: 1 });

module.exports = mongoose.model('Tablero', tableroSchema);
