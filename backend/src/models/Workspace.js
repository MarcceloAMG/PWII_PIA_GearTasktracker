const mongoose = require('mongoose');
const { LIMITE_TAREAS_BASICO } = require('../config/constantes');

const miembroSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    // Rol dentro de este equipo (puede ser distinto al rol del perfil)
    rolEnEquipo: { type: String, trim: true },
    // Límite individual de tareas activas; null = usa el límite general (solo Premium)
    limiteTareas: { type: Number, min: 1, default: null },
    fechaAlta: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título del proyecto es obligatorio'],
      trim: true,
      maxlength: [80, 'El título no puede pasar de 80 caracteres'],
    },
    codigo: { type: String, trim: true, uppercase: true },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    // El creador es el administrador del workspace
    creador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    miembros: [miembroSchema],
    // Límite general de tareas activas por usuario; solo se puede cambiar en Premium
    limiteGeneral: { type: Number, min: 1, default: LIMITE_TAREAS_BASICO },
    activo: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

workspaceSchema.index({ creador: 1, codigo: 1 }, { unique: true, sparse: true });
workspaceSchema.index({ 'miembros.usuario': 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
