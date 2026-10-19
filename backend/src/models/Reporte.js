const mongoose = require('mongoose');
const { MOTIVOS_REPORTE } = require('../config/constantes');

// Reporte de incumplimiento: lo crea el responsable de una tarea que no pudo cumplirla.
const reporteSchema = new mongoose.Schema(
  {
    tarea: { type: mongoose.Schema.Types.ObjectId, ref: 'Tarea', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    motivo: {
      type: String,
      required: [true, 'El motivo es obligatorio'],
      enum: { values: MOTIVOS_REPORTE, message: 'Motivo no válido' },
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción del reporte es obligatoria'],
      trim: true,
    },
  },
  { timestamps: { createdAt: 'fecha', updatedAt: false } }
);

reporteSchema.index({ workspace: 1, fecha: -1 });
reporteSchema.index({ workspace: 1, motivo: 1 });

module.exports = mongoose.model('Reporte', reporteSchema);
