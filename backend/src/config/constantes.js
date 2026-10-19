// Valores compartidos por modelos, servicios y validaciones.
// Los roles son los mismos que ofrece el select de registro.html.

const ROLES = [
  'Sin experiencia previa',
  'Programador Frontend',
  'Programador Backend',
  'Programador Fullstack',
  'Documentador',
  'Diseñador',
  'Editor',
  'Software Engineer',
  'Data Engineer',
];

// Una tarea puede pedir cualquier rol menos "Sin experiencia previa"
const ROLES_TAREA = ROLES.filter((rol) => rol !== 'Sin experiencia previa');

const PLANES = ['basico', 'premium'];
const LIMITE_TAREAS_BASICO = 3;

const ESTADOS_TAREA = [
  'disponible',
  'asignada',
  'en_proceso',
  'limbo',
  'pendiente_excepcion',
  'completada',
  'cancelada',
];

// Estados que ocupan cupo del límite de tareas simultáneas por usuario
const ESTADOS_ACTIVOS = ['asignada', 'en_proceso', 'pendiente_excepcion'];

const TIPOS_ASIGNACION = ['manual', 'voluntaria', 'automatica', 'excepcion'];

const TIPOS_NOTIFICACION = [
  'nuevo_miembro',
  'cambio_usuario',
  'tarea_asignada',
  'limbo',
  'reporte',
];

const MOTIVOS_REPORTE = [
  'FALTA DE TIEMPO',
  'MATERIAL INSUFICIENTE',
  'ENFERMEDAD',
  'OTRO',
];

module.exports = {
  ROLES,
  ROLES_TAREA,
  PLANES,
  LIMITE_TAREAS_BASICO,
  ESTADOS_TAREA,
  ESTADOS_ACTIVOS,
  TIPOS_ASIGNACION,
  TIPOS_NOTIFICACION,
  MOTIVOS_REPORTE,
};
