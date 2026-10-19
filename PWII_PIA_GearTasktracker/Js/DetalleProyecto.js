document.addEventListener('DOMContentLoaded', () => {
  const tablaTareasProyecto = document.getElementById('tablaTareasProyecto');
  const listaIntegrantesProyecto = document.getElementById('listaIntegrantesProyecto');
  const cajaMensaje = document.getElementById('mensajeProyecto');
  const accionesAdmin = document.getElementById('accionesAdmin');
  const btnAbrirAddMiembro = document.getElementById('btnAbrirAddMiembro');

  const idProyecto = new URLSearchParams(window.location.search).get('id');
  const yo = GearTask.obtenerUsuario();

  let proyecto = null; // workspace con sus integrantes
  let tareas = [];
  let tareaPorAsignar = null; // id de la tarea que se está asignando manualmente

  const ESTADOS = {
    disponible: ['Disponible', 'bg-secondary'],
    asignada: ['Asignada', 'bg-info text-dark'],
    en_proceso: ['En Proceso', 'bg-success'],
    limbo: ['Limbo (Exceso)', 'bg-danger'],
    pendiente_excepcion: ['Pendiente (Excepción)', 'bg-warning text-dark'],
    completada: ['Completada', 'bg-primary'],
  };

  // Todo lo que viene del servidor se inserta con textContent (nunca como HTML)
  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  const mostrarError = (caja, texto) => {
    caja.textContent = texto;
    caja.classList.toggle('d-none', !texto);
  };

  const esAdmin = () => proyecto && proyecto.creador === yo._id;
  const idDe = (usuario) => (usuario && usuario._id) || usuario;

  const cerrarModal = (id) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById(id));
    if (modal) modal.hide();
  };

  // ---- Pintado --------------------------------------------------------------

  function pintarEquipo() {
    listaIntegrantesProyecto.replaceChildren();
    proyecto.miembros.forEach((miembro) => {
      const usuario = miembro.usuario;
      const fila = crearElemento('div', 'team-member-item d-flex align-items-center gap-2 p-2 rounded-3 mb-2');
      const foto = crearElemento('img', 'team-avatar-sm rounded-circle');
      foto.src = GearTask.urlFoto(usuario.foto);
      foto.alt = 'Perfil';

      const datos = crearElemento('div', 'overflow-hidden');
      const nombre = idDe(usuario) === proyecto.creador ? `${usuario.usuario} (Admin)` : usuario.usuario;
      datos.append(
        crearElemento('span', 'text-white fw-bold d-block text-truncate small', nombre),
        crearElemento('small', 'text-info d-block micro-text', miembro.rolEnEquipo || usuario.rol)
      );
      fila.append(foto, datos);
      listaIntegrantesProyecto.append(fila);
    });

    // Select de asignación manual
    const select = document.getElementById('selectMiembroManual');
    select.replaceChildren();
    proyecto.miembros.forEach((miembro) => {
      const opcion = crearElemento(
        'option',
        '',
        `${miembro.usuario.usuario} (${miembro.rolEnEquipo || miembro.usuario.rol})`
      );
      opcion.value = miembro.usuario._id;
      select.append(opcion);
    });
  }

  function crearBoton(texto, clases, accion, id) {
    const boton = crearElemento('button', `btn btn-sm rounded-pill ${clases}`, texto);
    boton.type = 'button';
    boton.dataset.accion = accion;
    boton.dataset.id = id;
    return boton;
  }

  function botonesDe(tarea) {
    const botones = [];
    const esMia = tarea.asignadoA && tarea.asignadoA._id === yo._id;

    if (tarea.estado === 'disponible') {
      botones.push(crearBoton('Tomar Voluntariamente', 'btn-outline-warning', 'tomar', tarea._id));
      if (esAdmin()) botones.push(crearBoton('Asignar', 'btn-outline-light ms-1', 'asignar', tarea._id));
    }
    if (tarea.estado === 'limbo' && esAdmin()) {
      botones.push(crearBoton('Aprobar Excepción', 'btn-warning text-dark fw-bold', 'aprobar', tarea._id));
    }
    if (esMia && ['asignada', 'pendiente_excepcion'].includes(tarea.estado)) {
      botones.push(crearBoton('Iniciar', 'btn-outline-success', 'iniciar', tarea._id));
    }
    if (esMia && ['asignada', 'pendiente_excepcion', 'en_proceso'].includes(tarea.estado)) {
      botones.push(crearBoton('Completar', 'btn-success ms-1', 'completar', tarea._id));
    }
    if (esAdmin() && tarea.estado !== 'completada') {
      botones.push(crearBoton('Cancelar', 'btn-outline-danger ms-1', 'cancelar', tarea._id));
    }
    return botones;
  }

  function pintarTareas() {
    tablaTareasProyecto.replaceChildren();

    if (tareas.length === 0) {
      const fila = crearElemento('tr');
      const celda = crearElemento('td', 'text-white-50', 'Este proyecto todavía no tiene tareas.');
      celda.colSpan = 5;
      fila.append(celda);
      tablaTareasProyecto.append(fila);
      return;
    }

    tareas.forEach((tarea) => {
      const fila = crearElemento('tr', tarea.estado === 'limbo' ? 'table-danger-custom' : '');

      const celdaTitulo = crearElemento('td');
      celdaTitulo.append(
        crearElemento('div', 'fw-bold text-white', tarea.titulo),
        crearElemento('small', 'text-white-50', tarea.descripcion || '')
      );

      const celdaRol = crearElemento('td');
      celdaRol.append(crearElemento('span', 'badge bg-info text-dark', tarea.rolRequerido));

      const celdaAsignado = crearElemento('td');
      if (tarea.asignadoA) {
        const textoFecha = tarea.fechaLimite
          ? ` · hasta ${new Date(tarea.fechaLimite).toLocaleDateString('es-MX')}`
          : '';
        celdaAsignado.append(
          crearElemento('span', 'text-white fw-semibold', tarea.asignadoA.usuario),
          crearElemento('small', 'text-white-50', textoFecha)
        );
      } else {
        celdaAsignado.append(crearElemento('span', 'text-white-50 fst-italic', 'Sin asignar'));
      }

      const [etiqueta, clase] = ESTADOS[tarea.estado] || [tarea.estado, 'bg-secondary'];
      const celdaEstado = crearElemento('td');
      celdaEstado.append(crearElemento('span', `badge ${clase}`, etiqueta));

      const celdaAcciones = crearElemento('td', 'text-end');
      celdaAcciones.append(...botonesDe(tarea));

      fila.append(celdaTitulo, celdaRol, celdaAsignado, celdaEstado, celdaAcciones);
      tablaTareasProyecto.append(fila);
    });
  }

  // ---- Carga ----------------------------------------------------------------

  async function cargarTareas() {
    tareas = await GearTask.api('GET', `/workspaces/${idProyecto}/tareas`);
    pintarTareas();
  }

  async function cargarTodo() {
    if (!idProyecto) {
      window.location.href = 'AreaTrabajo.html';
      return;
    }
    try {
      proyecto = await GearTask.api('GET', `/workspaces/${idProyecto}`);
      document.getElementById('lblTituloProyecto').textContent = `Proyecto: ${proyecto.titulo}`;
      document.getElementById('lblLimite').textContent =
        `Límite general: máximo ${proyecto.limiteGeneral} tareas activas por usuario`;
      accionesAdmin.classList.toggle('d-none', !esAdmin());
      btnAbrirAddMiembro.classList.toggle('d-none', !esAdmin());
      pintarEquipo();
      await cargarTareas();
    } catch (error) {
      mostrarError(cajaMensaje, error.message);
      tablaTareasProyecto.replaceChildren();
    }
  }

  // Ejecuta una acción de la API, refresca la tabla y muestra el error si lo hay
  async function ejecutar(accion) {
    mostrarError(cajaMensaje, '');
    try {
      await accion();
      await cargarTareas();
    } catch (error) {
      mostrarError(cajaMensaje, error.message);
    }
  }

  // ---- Acciones de la tabla (voluntaria, excepción, avance, cancelar) --------

  tablaTareasProyecto.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const { accion, id } = boton.dataset;

    if (accion === 'asignar') {
      tareaPorAsignar = id;
      mostrarError(document.getElementById('mensajeAsignar'), '');
      new bootstrap.Modal(document.getElementById('modalAsignarManual')).show();
      return;
    }
    if (accion === 'cancelar' && !window.confirm('¿Cancelar esta tarea?')) return;

    const rutas = {
      tomar: ['PATCH', `/tareas/${id}/tomar`],
      aprobar: ['PATCH', `/tareas/${id}/aprobar-excepcion`],
      iniciar: ['PATCH', `/tareas/${id}/iniciar`],
      completar: ['PATCH', `/tareas/${id}/completar`],
      cancelar: ['DELETE', `/tareas/${id}`],
    };
    const [metodo, ruta] = rutas[accion];
    ejecutar(() => GearTask.api(metodo, ruta));
  });

  // ---- Asignación manual ----------------------------------------------------

  document.getElementById('btnConfirmarAsignacionManual').addEventListener('click', async () => {
    const caja = document.getElementById('mensajeAsignar');
    const fecha = document.getElementById('fechaLimiteManual').value;
    if (!fecha) {
      mostrarError(caja, 'La fecha límite es obligatoria');
      return;
    }
    try {
      await GearTask.api('PATCH', `/tareas/${tareaPorAsignar}/asignar`, {
        usuarioId: document.getElementById('selectMiembroManual').value,
        fechaLimite: fecha,
      });
      cerrarModal('modalAsignarManual');
      document.getElementById('fechaLimiteManual').value = '';
      await cargarTareas();
    } catch (error) {
      mostrarError(caja, error.message);
    }
  });

  // ---- Asignación automática ------------------------------------------------

  document.getElementById('btnAutoAsignar').addEventListener('click', () => {
    ejecutar(async () => {
      const resultado = await GearTask.api('POST', `/workspaces/${idProyecto}/tareas/auto-asignar`, {});
      const aviso = `Asignación automática: ${resultado.asignadas} asignada(s)`;
      window.alert(
        resultado.sinCandidato > 0
          ? `${aviso}. ${resultado.sinCandidato} se quedó sin asignar (nadie con ese rol y cupo libre).`
          : `${aviso}.`
      );
    });
  });

  // ---- Nueva tarea ----------------------------------------------------------

  const formNuevaTarea = document.getElementById('formNuevaTarea');
  formNuevaTarea.addEventListener('submit', async (e) => {
    e.preventDefault();
    const caja = document.getElementById('mensajeNuevaTarea');
    mostrarError(caja, '');
    const boton = formNuevaTarea.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
      await GearTask.api('POST', `/workspaces/${idProyecto}/tareas`, {
        titulo: document.getElementById('tituloTarea').value.trim(),
        descripcion: document.getElementById('descTarea').value.trim(),
        rolRequerido: document.getElementById('rolTareaRequired').value,
      });
      cerrarModal('modalNuevaTarea');
      formNuevaTarea.reset();
      await cargarTareas();
    } catch (error) {
      mostrarError(caja, error.message);
    } finally {
      boton.disabled = false;
    }
  });

  // ---- Añadir miembros ------------------------------------------------------

  let usuarioEncontrado = null;
  const resultadoBusqueda = document.getElementById('resultadoBusquedaModal');
  const cajaAddMiembro = document.getElementById('mensajeAddMiembro');

  document.getElementById('btnBuscarModal').addEventListener('click', async () => {
    const consulta = document.getElementById('inputBuscarModal').value.trim();
    if (!consulta) return;
    mostrarError(cajaAddMiembro, '');
    resultadoBusqueda.classList.add('d-none');
    usuarioEncontrado = null;

    try {
      const encontrados = await GearTask.api('GET', `/usuarios/buscar?usuario=${encodeURIComponent(consulta)}`);
      if (encontrados.length === 0) {
        mostrarError(cajaAddMiembro, `No existe ningún usuario llamado "${consulta}"`);
        return;
      }
      usuarioEncontrado = encontrados[0];
      document.getElementById('nombreUsuarioEncontrado').textContent = usuarioEncontrado.usuario;
      resultadoBusqueda.classList.remove('d-none');
    } catch (error) {
      mostrarError(cajaAddMiembro, error.message);
    }
  });

  document.getElementById('btnConfirmarAddMiembro').addEventListener('click', async () => {
    if (!usuarioEncontrado) return;
    try {
      proyecto = await GearTask.api('POST', `/workspaces/${idProyecto}/miembros`, {
        usuarioId: usuarioEncontrado._id,
      });
      pintarEquipo();
      cerrarModal('modalAddMiembro');
      resultadoBusqueda.classList.add('d-none');
      document.getElementById('inputBuscarModal').value = '';
      usuarioEncontrado = null;
    } catch (error) {
      mostrarError(cajaAddMiembro, error.message);
    }
  });

  cargarTodo();
});
