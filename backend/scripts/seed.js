// Datos de ejemplo para probar y demostrar el proyecto:  npm run seed
// Solo toca los datos de la demo (usuarios con correo @geartask.demo y lo que cuelga de ellos);
// si lo corres otra vez, los recrea desde cero sin afectar nada más de la base.
const mongoose = require('mongoose');
const { mongoUri } = require('../src/config/env');
const Usuario = require('../src/models/Usuario');
const Workspace = require('../src/models/Workspace');
const Tablero = require('../src/models/Tablero');
const Tarea = require('../src/models/Tarea');
const Reporte = require('../src/models/Reporte');
const Notificacion = require('../src/models/Notificacion');
const Mensaje = require('../src/models/Mensaje');

const PASSWORD = '123456';
const DOMINIO = '@geartask.demo';

const diasAtras = (dias, hora = 12) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha;
};
const diasAdelante = (dias) => diasAtras(-dias);

async function limpiarDemo() {
  const demo = await Usuario.find({ correo: new RegExp(`${DOMINIO.replace('.', '\\.')}$`) }).select('_id');
  const ids = demo.map((u) => u._id);
  if (ids.length === 0) return;

  const workspaces = await Workspace.find({ creador: { $in: ids } }).select('_id');
  const idsWorkspace = workspaces.map((w) => w._id);

  await Promise.all([
    Tarea.deleteMany({ workspace: { $in: idsWorkspace } }),
    Tablero.deleteMany({ workspace: { $in: idsWorkspace } }),
    Reporte.deleteMany({ workspace: { $in: idsWorkspace } }),
    Notificacion.deleteMany({ $or: [{ destinatario: { $in: ids } }, { workspace: { $in: idsWorkspace } }] }),
    Mensaje.deleteMany({ $or: [{ de: { $in: ids } }, { para: { $in: ids } }] }),
    Workspace.deleteMany({ _id: { $in: idsWorkspace } }),
    Usuario.deleteMany({ _id: { $in: ids } }),
  ]);
}

async function crearUsuarios() {
  const datos = [
    ['admin_demo', 'Ana Administradora', 'Programador Fullstack', 'premium', '8110000001'],
    ['Ejemplo_01', 'Eduardo Ejemplo', 'Programador Frontend', 'basico', '8110000002'],
    ['Luis', 'Luis Documentador', 'Documentador', 'basico', '8110000003'],
    ['Ejemplo_02', 'Elena Diseño', 'Diseñador', 'basico', '8110000004'],
  ];
  const usuarios = {};
  for (const [usuario, nombreCompleto, rol, plan, telefono] of datos) {
    // create() para que el modelo encripte la contraseña
    usuarios[usuario] = await Usuario.create({
      usuario,
      nombreCompleto,
      rol,
      plan,
      telefono,
      correo: `${usuario.toLowerCase()}${DOMINIO}`,
      password: PASSWORD,
    });
  }
  return usuarios;
}

async function crearWorkspaces(u) {
  const t1 = await Workspace.create({
    titulo: 'Sistema Web Principal',
    codigo: 'TAREAS01',
    descripcion: 'Desarrollo de módulos de frontend y arquitectura general para el gestor de tareas corporativo.',
    creador: u.admin_demo._id,
    miembros: [
      { usuario: u.admin_demo._id, rolEnEquipo: 'Programador Fullstack' },
      { usuario: u.Ejemplo_01._id },
      { usuario: u.Luis._id },
    ],
  });
  const t2 = await Workspace.create({
    titulo: 'Diseño de Interfaz e Identidad',
    codigo: 'TAREAS02',
    descripcion: 'Maquetación de componentes, definición de paleta de colores y componentes interactivos.',
    creador: u.admin_demo._id,
    miembros: [{ usuario: u.admin_demo._id, rolEnEquipo: 'Programador Fullstack' }, { usuario: u.Ejemplo_02._id }],
  });
  const [tab1, tab2] = await Tablero.create([
    { workspace: t1._id, nombre: 'General' },
    { workspace: t2._id, nombre: 'General' },
  ]);
  return { t1, t2, tab1, tab2 };
}

async function crearTareas(u, { t1, t2, tab1, tab2 }) {
  const base = (workspace, tablero) => ({ workspace: workspace._id, tablero: tablero._id, creadoPor: u.admin_demo._id });
  const A = base(t1, tab1);
  const B = base(t2, tab2);

  // Tablero de TAREAS01: una disponible, una en limbo, una en proceso, una asignada
  const tareas = await Tarea.create([
    { ...A, titulo: 'Diseñar interfaz de notificaciones', descripcion: 'Maquetación con Bootstrap y CSS responsivo', rolRequerido: 'Programador Frontend' },
    { ...A, titulo: 'Redactar manual de usuario', descripcion: 'Documento técnico en formato PDF', rolRequerido: 'Documentador', asignadoA: u.Luis._id, tipoAsignacion: 'manual', estado: 'limbo', fechaLimite: diasAdelante(10) },
    { ...A, titulo: 'Modularizar archivos JavaScript', rolRequerido: 'Programador Frontend', asignadoA: u.Ejemplo_01._id, tipoAsignacion: 'voluntaria', estado: 'en_proceso', fechaLimite: diasAdelante(5) },
    { ...A, titulo: 'Documentar la API', rolRequerido: 'Documentador', asignadoA: u.Luis._id, tipoAsignacion: 'automatica', estado: 'asignada' },
    { ...B, titulo: 'Definir paleta de colores', rolRequerido: 'Diseñador', asignadoA: u.Ejemplo_02._id, tipoAsignacion: 'manual', estado: 'asignada', fechaLimite: diasAdelante(7) },
  ]);

  // Tareas ya completadas en distintos días y meses (alimentan la gráfica de productividad)
  const completadas = [
    [u.admin_demo, 1, 'Configurar el repositorio', 'Programador Fullstack'],
    [u.admin_demo, 1, 'Crear el login', 'Programador Fullstack'],
    [u.admin_demo, 3, 'Integrar la API de proyectos', 'Programador Fullstack'],
    [u.admin_demo, 6, 'Revisar pull requests', 'Programador Fullstack'],
    [u.admin_demo, 34, 'Diseñar el modelo de datos', 'Programador Fullstack'],
    [u.admin_demo, 40, 'Definir las rutas', 'Programador Fullstack'],
    [u.admin_demo, 70, 'Levantar el proyecto base', 'Programador Fullstack'],
    [u.Ejemplo_01, 2, 'Maquetar la pantalla principal', 'Programador Frontend'],
    [u.Ejemplo_01, 4, 'Estilos del área de trabajo', 'Programador Frontend'],
  ];
  await Tarea.create(
    completadas.map(([usuario, dias, titulo, rol]) => ({
      ...A,
      titulo,
      rolRequerido: rol,
      asignadoA: usuario._id,
      tipoAsignacion: 'manual',
      estado: 'completada',
      fechaCompletada: diasAtras(dias),
      fechaLimite: diasAtras(dias - 1),
    }))
  );
  return tareas;
}

async function crearReportes(u, { t1, t2 }, tareas) {
  const reportes = [
    [t1, u.Ejemplo_01, tareas[0], 'FALTA DE TIEMPO', 'No alcancé a entregar la tarea dentro del tiempo límite.', 2],
    [t1, u.Luis, tareas[3], 'FALTA DE TIEMPO', 'Se me juntaron varias entregas de la escuela.', 35],
    [t2, u.Ejemplo_02, tareas[4], 'MATERIAL INSUFICIENTE', 'Mi computadora se dañó y no pude terminar el trabajo asignado.', 5],
    [t1, u.Luis, tareas[1], 'ENFERMEDAD', 'Estuve enfermo toda la semana.', 65],
  ];
  await Reporte.create(
    reportes.map(([workspace, usuario, tarea, motivo, descripcion, dias]) => ({
      workspace: workspace._id,
      usuario: usuario._id,
      tarea: tarea._id,
      motivo,
      descripcion,
      fecha: diasAtras(dias),
    }))
  );
}

async function crearNotificacionesYChats(u, { t1, t2 }) {
  const admin = u.admin_demo._id;
  await Notificacion.create([
    { destinatario: admin, tipo: 'nuevo_miembro', mensaje: 'Ejemplo_01 se unió a tu equipo en el proyecto TAREAS01', workspace: t1._id, origen: u.Ejemplo_01._id, fecha: diasAtras(3) },
    { destinatario: admin, tipo: 'nuevo_miembro', mensaje: 'Ejemplo_02 se unió a tu equipo en el proyecto TAREAS02', workspace: t2._id, origen: u.Ejemplo_02._id, fecha: diasAtras(2) },
    { destinatario: admin, tipo: 'cambio_usuario', mensaje: 'José cambió su nombre de usuario a Luis (Sistema Web Principal)', workspace: t1._id, origen: u.Luis._id, fecha: diasAtras(1) },
    { destinatario: admin, tipo: 'limbo', mensaje: 'Luis superó su límite de tareas con "Redactar manual de usuario" (Sistema Web Principal); requiere tu aprobación', workspace: t1._id, origen: u.Luis._id, fecha: diasAtras(0, 9) },
  ]);

  await Mensaje.create([
    { de: u.Ejemplo_01._id, para: admin, texto: '¿Ya quedó listo el frontend??', fecha: diasAtras(0, 10), leido: true },
    { de: admin, para: u.Ejemplo_01._id, texto: '¡Sí! Ya lo subí a GitHub.', fecha: diasAtras(0, 11), leido: true },
    { de: u.Ejemplo_01._id, para: admin, texto: 'Perfecto, voy a probar el backend.', fecha: diasAtras(0, 12) },
  ]);
}

async function main() {
  await mongoose.connect(mongoUri);
  console.info(`Conectado a ${mongoose.connection.name}`);

  await limpiarDemo();
  const usuarios = await crearUsuarios();
  const espacios = await crearWorkspaces(usuarios);
  const tareas = await crearTareas(usuarios, espacios);
  await crearReportes(usuarios, espacios, tareas);
  await crearNotificacionesYChats(usuarios, espacios);

  console.info('\nDatos de ejemplo listos. Cuentas (contraseña: %s):', PASSWORD);
  console.info('  admin_demo%s  → administrador, plan Premium', DOMINIO);
  console.info('  ejemplo_01%s  → Programador Frontend', DOMINIO);
  console.info('  luis%s        → Documentador', DOMINIO);
  console.info('  ejemplo_02%s  → Diseñador', DOMINIO);
}

main()
  .catch((error) => {
    console.error('Falló el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
