const mongoose = require('mongoose');
const { TIPOS_NOTIFICACION } = require('../config/constantes');

// Según la especificación: se pueden dar de alta y cambian a "leída",
// pero su contenido nunca se modifica.
const notificacionSchema = new mongoose.Schema(
  {
    destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipo: { type: String, enum: TIPOS_NOTIFICACION, required: true },
    mensaje: { type: String, required: true, trim: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
    // Usuario que originó el evento (quien se unió, quien cambió su nombre...)
    origen: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    leida: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'fecha', updatedAt: false } }
);

notificacionSchema.index({ destinatario: 1, leida: 1, fecha: -1 });

module.exports = mongoose.model('Notificacion', notificacionSchema);
