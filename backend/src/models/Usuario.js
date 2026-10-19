const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, PLANES } = require('../config/constantes');

const usuarioSchema = new mongoose.Schema(
  {
    foto: { type: String, default: 'perfil.jpg' },
    nombreCompleto: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre completo es muy corto'],
    },
    usuario: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
      maxlength: [30, 'El nombre de usuario no puede pasar de 30 caracteres'],
      match: [/^[A-Za-z0-9_.-]+$/, 'El usuario solo admite letras, números, _ . y -'],
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido'],
    },
    // Se guarda encriptada; select:false evita devolverla en las consultas
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'El teléfono debe tener 10 dígitos'],
    },
    rol: {
      type: String,
      enum: { values: ROLES, message: 'Rol no válido' },
      default: 'Sin experiencia previa',
    },
    plan: { type: String, enum: PLANES, default: 'basico' },
  },
  { timestamps: { createdAt: 'fechaRegistro', updatedAt: false } }
);

// Encripta la contraseña solo cuando se crea o se cambia
usuarioSchema.pre('save', async function encriptarPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

usuarioSchema.methods.compararPassword = function compararPassword(passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

usuarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
