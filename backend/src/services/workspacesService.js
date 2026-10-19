const Workspace = require('../models/Workspace');
const Tablero = require('../models/Tablero');
const Usuario = require('../models/Usuario');
const ApiError = require('../utils/ApiError');
const { exigirPremium } = require('../utils/plan');
const { avisarNuevosMiembros } = require('./notificacionService');
const { liberarTareasDe } = require('./tareasService');

const CAMPOS_USUARIO = 'usuario nombreCompleto foto rol';

// Convierte un título en código: "Tareas 01" -> "TAREAS01"
function generarCodigo(titulo) {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 20);
}

const conMiembros = (consulta) => consulta.populate('miembros.usuario', CAMPOS_USUARIO);

async function obtener(id) {
  return conMiembros(Workspace.findById(id));
}

// Proyectos donde el usuario es administrador o integrante
async function listarDelUsuario(idUsuario) {
  return conMiembros(
    Workspace.find({ 'miembros.usuario': idUsuario, activo: true }).sort({ fechaCreacion: -1 })
  );
}

async function crear(admin, { titulo, descripcion, miembros = [] }) {
  const codigo = generarCodigo(titulo);
  if (!codigo) throw ApiError.badRequest('El título debe incluir letras o números');
  if (await Workspace.exists({ creador: admin._id, codigo, activo: true })) {
    throw ApiError.conflicto('Ya tienes un proyecto con ese título o código');
  }

  // Sin repetidos y sin el propio admin (ya entra como integrante)
  const ids = [...new Set(miembros)].filter((id) => id !== admin.id);
  const encontrados = await Usuario.find({ _id: { $in: ids } }).select('_id usuario');
  if (encontrados.length !== ids.length) {
    throw ApiError.badRequest('Alguno de los usuarios que quieres añadir no existe');
  }

  const workspace = await Workspace.create({
    titulo,
    codigo,
    descripcion,
    creador: admin._id,
    miembros: [
      { usuario: admin._id, rolEnEquipo: admin.rol },
      ...encontrados.map((u) => ({ usuario: u._id })),
    ],
  });
  await Tablero.create({ workspace: workspace._id, nombre: 'General' });
  await avisarNuevosMiembros(workspace, admin, encontrados);

  return obtener(workspace._id);
}

async function actualizar(workspace, { titulo, descripcion }) {
  const codigo = generarCodigo(titulo);
  const repetido = await Workspace.exists({
    creador: workspace.creador,
    codigo,
    activo: true,
    _id: { $ne: workspace._id },
  });
  if (repetido) throw ApiError.conflicto('Ya tienes un proyecto con ese título o código');

  Object.assign(workspace, { titulo, descripcion, codigo });
  await workspace.save();
  return obtener(workspace._id);
}

// Baja lógica: se conservan tareas e historial para los reportes
async function eliminar(workspace) {
  workspace.activo = false;
  // Libera el código para que el admin pueda reutilizarlo en otro proyecto
  workspace.codigo = `${workspace.codigo}-ELIM-${Date.now()}`;
  await workspace.save();
}

// Solo Premium puede personalizar el límite general de tareas por integrante
async function cambiarLimiteGeneral(admin, workspace, limiteGeneral) {
  exigirPremium(admin);
  workspace.limiteGeneral = limiteGeneral;
  await workspace.save();
  return obtener(workspace._id);
}

async function agregarMiembro(admin, workspace, usuarioId) {
  if (workspace.miembros.some((m) => m.usuario.equals(usuarioId))) {
    throw ApiError.conflicto('Ese usuario ya forma parte del proyecto');
  }
  const usuario = await Usuario.findById(usuarioId).select('_id usuario');
  if (!usuario) throw ApiError.noEncontrado('El usuario no existe');

  workspace.miembros.push({ usuario: usuario._id });
  await workspace.save();
  await avisarNuevosMiembros(workspace, admin, [usuario]);
  return obtener(workspace._id);
}

// - rolEnEquipo: solo lo cambia el propio integrante (el admin no edita datos de otros)
// - limiteTareas: solo el admin y solo en Premium; null regresa al límite general
async function modificarMiembro(actor, workspace, idMiembro, { rolEnEquipo, limiteTareas }) {
  const miembro = workspace.miembros.find((m) => m.usuario.equals(idMiembro));
  if (!miembro) throw ApiError.noEncontrado('Ese usuario no pertenece al proyecto');

  if (rolEnEquipo !== undefined) {
    if (!actor._id.equals(idMiembro)) {
      throw ApiError.prohibido('Cada integrante cambia su propio rol');
    }
    miembro.rolEnEquipo = rolEnEquipo;
  }

  if (limiteTareas !== undefined) {
    if (!workspace.creador.equals(actor._id)) {
      throw ApiError.prohibido('Solo el administrador puede definir límites');
    }
    exigirPremium(actor);
    miembro.limiteTareas = limiteTareas;
  }

  await workspace.save();
  return obtener(workspace._id);
}

// El admin saca a cualquiera menos a sí mismo; cada integrante puede salirse
async function quitarMiembro(actor, workspace, idMiembro) {
  if (workspace.creador.equals(idMiembro)) {
    throw ApiError.badRequest('El administrador no puede salir; elimina el proyecto si ya no lo quieres');
  }
  const esAdmin = workspace.creador.equals(actor._id);
  if (!esAdmin && !actor._id.equals(idMiembro)) {
    throw ApiError.prohibido('Solo el administrador puede sacar a otros integrantes');
  }
  const antes = workspace.miembros.length;
  workspace.miembros = workspace.miembros.filter((m) => !m.usuario.equals(idMiembro));
  if (workspace.miembros.length === antes) {
    throw ApiError.noEncontrado('Ese usuario no pertenece al proyecto');
  }
  await workspace.save();
  await liberarTareasDe(workspace._id, idMiembro);
  return obtener(workspace._id);
}

// ---- Tableros ----
const listarTableros = (idWorkspace) => Tablero.find({ workspace: idWorkspace, activo: true }).sort({ fechaCreacion: 1 });

async function crearTablero(workspace, { nombre, descripcion }) {
  return Tablero.create({ workspace: workspace._id, nombre, descripcion });
}

async function actualizarTablero(tablero, { nombre, descripcion }) {
  tablero.nombre = nombre;
  if (descripcion !== undefined) tablero.descripcion = descripcion;
  return tablero.save();
}

async function eliminarTablero(tablero) {
  const restantes = await Tablero.countDocuments({ workspace: tablero.workspace, activo: true });
  if (restantes <= 1) throw ApiError.badRequest('El proyecto debe conservar al menos un tablero');
  tablero.activo = false;
  await tablero.save();
}

module.exports = {
  obtener,
  listarDelUsuario,
  crear,
  actualizar,
  eliminar,
  cambiarLimiteGeneral,
  agregarMiembro,
  modificarMiembro,
  quitarMiembro,
  listarTableros,
  crearTablero,
  actualizarTablero,
  eliminarTablero,
};
