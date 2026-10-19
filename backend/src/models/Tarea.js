const mongoose = require('mongoose');
const { ROLES_TAREA, ESTADOS_TAREA, TIPOS_ASIGNACION } = require('../config/constantes');

const tareaSchema = new mongoose.Schema(
  {
    tablero: { type: mongoose.Schema.Types.ObjectId, ref: 'Tablero', required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    titulo: {
      type: String,
      required: [true, 'El título de la tarea es obligatorio'],
      trim: true,
      maxlength: [120, 'El título no puede pasar de 120 caracteres'],
    },
    descripcion: { type: String, trim: true, default: '' },
    rolRequerido: {
      type: String,
      required: [true, 'El rol requerido es obligatorio'],
      enum: { values: ROLES_TAREA, message: 'Rol requerido no válido' },
    },
    asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    // Cómo llegó la tarea a su responsable
    tipoAsignacion: { type: String, enum: TIPOS_ASIGNACION, default: null },
    estado: { type: String, enum: ESTADOS_TAREA, default: 'disponible' },
    fechaLimite: { type: Date, default: null },
    fechaCompletada: { type: Date, default: null },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

// Consultas frecuentes: tablero de un workspace y tareas activas de un usuario
tareaSchema.index({ workspace: 1, estado: 1 });
tareaSchema.index({ asignadoA: 1, estado: 1 });
tareaSchema.index({ tablero: 1 });

module.exports = mongoose.model('Tarea', tareaSchema);
