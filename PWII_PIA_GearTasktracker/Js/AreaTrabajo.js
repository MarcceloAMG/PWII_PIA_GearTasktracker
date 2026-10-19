document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // PERFIL: los datos del sidebar vienen del usuario con sesión iniciada
  const pintarPerfil = (usuario) => {
    const poner = (id, valor) => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.textContent = valor || '';
    };
    poner('dataNombre', usuario.nombreCompleto);
    poner('dataUsuario', usuario.usuario);
    poner('dataCorreo', usuario.correo);
    poner('dataTelefono', usuario.telefono);
    poner('dataRol', usuario.rol);
    poner('usuarioActual', usuario.usuario);

    const foto = document.getElementById('profilePhoto');
    if (foto) foto.src = GearTask.urlFoto(usuario.foto);
  };

  // Se pinta primero lo guardado al iniciar sesión y luego se refresca con la API
  const usuarioGuardado = GearTask.obtenerUsuario();
  if (usuarioGuardado) pintarPerfil(usuarioGuardado);

  GearTask.api('GET', '/usuarios/me')
    .then((usuario) => {
      GearTask.guardarSesion(GearTask.obtenerToken(), usuario);
      pintarPerfil(usuario);
    })
    .catch((error) => console.warn('No se pudo cargar el perfil:', error.message));

  // CERRAR SESIÓN: se borra el token; Pantallas.js se encarga de llevar a PaginaPrincipal.html
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => GearTask.limpiarSesion());
  }

  // AJUSTES: cambiar nombre de usuario y/o contraseña
  const formAjustes = document.getElementById('formAjustes');
  const modalAjustes = document.getElementById('modalAjustes');
  const cajaAjustes = document.getElementById('ajustesMensaje');

  const mostrarMensajeAjustes = (texto, tipo) => {
    cajaAjustes.textContent = texto;
    cajaAjustes.className = `alert alert-${tipo} py-2 small`;
  };

  const ocultarMensajeAjustes = () => {
    cajaAjustes.textContent = '';
    cajaAjustes.className = 'alert py-2 small d-none';
  };

  if (modalAjustes) {
    modalAjustes.addEventListener('hidden.bs.modal', () => {
      formAjustes.reset();
      ocultarMensajeAjustes();
    });
  }

  if (formAjustes) {
    formAjustes.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nuevoUsuario = document.getElementById('nuevoUsuario').value.trim();
      const passActual = document.getElementById('passActual').value;
      const nuevaPass = document.getElementById('nuevaPass').value;

      if (!nuevoUsuario && !nuevaPass) {
        mostrarMensajeAjustes('No hay cambios que guardar', 'warning');
        return;
      }
      if (nuevaPass && !passActual) {
        mostrarMensajeAjustes('Escribe tu contraseña actual para cambiarla', 'warning');
        return;
      }

      const boton = formAjustes.querySelector('button[type="submit"]');
      boton.disabled = true;
      const hechos = [];

      try {
        if (nuevoUsuario) {
          const usuario = await GearTask.api('PATCH', '/usuarios/me/usuario', {
            usuario: nuevoUsuario,
          });
          GearTask.guardarSesion(GearTask.obtenerToken(), usuario);
          pintarPerfil(usuario);
          hechos.push('Nombre de usuario actualizado');
        }

        if (nuevaPass) {
          await GearTask.api('PATCH', '/usuarios/me/password', {
            passwordActual: passActual,
            passwordNueva: nuevaPass,
          });
          hechos.push('Contraseña actualizada');
        }

        formAjustes.reset();
        mostrarMensajeAjustes(hechos.join('. '), 'success');
      } catch (error) {
        // Si el usuario ya cambió pero la contraseña falló, se avisa de lo que sí se guardó
        const guardado = hechos.length ? `${hechos.join('. ')}. ` : '';
        mostrarMensajeAjustes(guardado + error.message, 'danger');
      } finally {
        boton.disabled = false;
      }
    });
  }

  const switchVersion = document.getElementById('switchVersion');
  if (switchVersion) {
    switchVersion.addEventListener('change', () => {
      window.location.reload();
    });
  }

  // PROYECTOS: se listan desde la API; cada tarjeta lleva al detalle con el id del workspace
  const btnBuscarUsuario = document.getElementById('btnBuscarUsuario');
  const inputBuscarUsuario = document.getElementById('inputBuscarUsuario');
  const listaChipsMiembros = document.getElementById('listaChipsMiembros');
  const formNuevoProyecto = document.getElementById('formNuevoProyecto');
  const gridProyectos = document.getElementById('gridProyectos');
  const cajaProyecto = document.getElementById('proyectoMensaje');

  // Se arma con textContent para que ningún dato del servidor se interprete como HTML
  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });

  function crearTarjetaProyecto(proyecto) {
    const columna = crearElemento('div', 'col-12 col-md-6 col-lg-4');
    const tarjeta = crearElemento(
      'div',
      'project-card p-4 rounded-4 shadow h-100 d-flex flex-column justify-content-between'
    );
    tarjeta.addEventListener('click', () => {
      window.location.href = `DetalleProyecto.html?id=${encodeURIComponent(proyecto._id)}`;
    });

    const arriba = crearElemento('div');
    const fila = crearElemento('div', 'd-flex align-items-center justify-content-between mb-2');
    fila.append(
      crearElemento('span', 'badge bg-warning text-dark fw-bold', proyecto.codigo || 'PROYECTO'),
      crearElemento('small', 'text-white-50')
    );
    const iconoMiembros = crearElemento('i', 'bi bi-people-fill me-1');
    fila.lastChild.append(iconoMiembros, `${proyecto.miembros.length} Miembros`);
    arriba.append(
      fila,
      crearElemento('h4', 'text-white fw-bold mb-2', proyecto.titulo),
      crearElemento('p', 'text-white-50 small mb-3 text-truncate-3', proyecto.descripcion)
    );

    const abajo = crearElemento(
      'div',
      'pt-3 border-top border-secondary d-flex justify-content-between align-items-center'
    );
    const enlace = crearElemento('span', 'btn-link text-warning fw-semibold text-decoration-none small', 'Ver Tablero ');
    enlace.append(crearElemento('i', 'bi bi-arrow-right'));
    abajo.append(crearElemento('span', 'text-white-50 small', `Creado: ${formatearFecha(proyecto.fechaCreacion)}`), enlace);

    tarjeta.append(arriba, abajo);
    columna.append(tarjeta);
    return columna;
  }

  async function cargarProyectos() {
    if (!gridProyectos) return;
    try {
      const proyectos = await GearTask.api('GET', '/workspaces');
      gridProyectos.replaceChildren();
      if (proyectos.length === 0) {
        gridProyectos.append(
          crearElemento('p', 'text-white-50', 'Todavía no tienes proyectos. Crea el primero con "Nuevo Proyecto".')
        );
        return;
      }
      proyectos.forEach((proyecto) => gridProyectos.append(crearTarjetaProyecto(proyecto)));
    } catch (error) {
      gridProyectos.replaceChildren(crearElemento('p', 'text-danger', error.message));
    }
  }

  cargarProyectos();

  // INTEGRANTES: solo se pueden añadir usuarios que existan (se buscan en el servidor)
  let miembrosAgregados = []; // [{ _id, usuario }]

  const mostrarErrorProyecto = (texto) => {
    if (!cajaProyecto) return;
    cajaProyecto.textContent = texto;
    cajaProyecto.classList.toggle('d-none', !texto);
  };

  function renderChips() {
    if (!listaChipsMiembros) return;
    listaChipsMiembros.replaceChildren();

    const creador = crearElemento('span', 'badge bg-secondary p-2 d-flex align-items-center gap-2');
    creador.append(crearElemento('i', 'bi bi-person-circle'), ' Tú (Creador)');
    listaChipsMiembros.append(creador);

    miembrosAgregados.forEach((miembro) => {
      const chip = crearElemento('span', 'badge bg-warning text-dark p-2 d-flex align-items-center gap-2');
      const quitar = crearElemento('button', 'btn-close btn-close-sm ms-1');
      quitar.type = 'button';
      quitar.setAttribute('aria-label', `Quitar a ${miembro.usuario}`);
      quitar.addEventListener('click', () => {
        miembrosAgregados = miembrosAgregados.filter((m) => m._id !== miembro._id);
        renderChips();
      });
      chip.append(crearElemento('i', 'bi bi-person-fill'), ` ${miembro.usuario}`, quitar);
      listaChipsMiembros.append(chip);
    });
  }

  if (btnBuscarUsuario) {
    btnBuscarUsuario.addEventListener('click', async () => {
      const consulta = inputBuscarUsuario.value.trim();
      if (!consulta) return;
      mostrarErrorProyecto('');

      try {
        const encontrados = await GearTask.api(
          'GET',
          `/usuarios/buscar?usuario=${encodeURIComponent(consulta)}`
        );
        if (encontrados.length === 0) {
          mostrarErrorProyecto(`No existe ningún usuario llamado "${consulta}"`);
          return;
        }
        const usuario = encontrados[0];
        if (miembrosAgregados.some((m) => m._id === usuario._id)) {
          mostrarErrorProyecto('Ese usuario ya está en la lista');
          return;
        }
        miembrosAgregados.push({ _id: usuario._id, usuario: usuario.usuario });
        renderChips();
        inputBuscarUsuario.value = '';
      } catch (error) {
        mostrarErrorProyecto(error.message);
      }
    });
  }

  const modalProyecto = document.getElementById('modalNuevoProyecto');
  if (modalProyecto) {
    modalProyecto.addEventListener('hidden.bs.modal', () => {
      formNuevoProyecto.reset();
      miembrosAgregados = [];
      renderChips();
      mostrarErrorProyecto('');
    });
  }

  if (formNuevoProyecto) {
    formNuevoProyecto.addEventListener('submit', async (e) => {
      e.preventDefault();
      mostrarErrorProyecto('');

      const boton = formNuevoProyecto.querySelector('button[type="submit"]');
      boton.disabled = true;

      try {
        await GearTask.api('POST', '/workspaces', {
          titulo: document.getElementById('tituloProyecto').value.trim(),
          descripcion: document.getElementById('descProyecto').value.trim(),
          miembros: miembrosAgregados.map((m) => m._id),
        });
        const modal = bootstrap.Modal.getInstance(modalProyecto);
        if (modal) modal.hide(); // al cerrarse se limpia el formulario
        await cargarProyectos();
      } catch (error) {
        mostrarErrorProyecto(error.message);
      } finally {
        boton.disabled = false;
      }
    });
  }

  // MIS TAREAS: las que tengo asignadas en todos mis proyectos
  const tablaMisTareas = document.getElementById('tablaMisTareas');
  const ESTADOS_TAREA = {
    asignada: ['Asignada', 'bg-info text-dark'],
    en_proceso: ['En Proceso', 'bg-success'],
    limbo: ['Limbo (Exceso)', 'bg-danger'],
    pendiente_excepcion: ['Pendiente (Excepción)', 'bg-warning text-dark'],
  };

  async function cargarMisTareas() {
    if (!tablaMisTareas) return;
    const mensajeFila = (texto, clase) => {
      const fila = crearElemento('tr');
      const celda = crearElemento('td', clase, texto);
      celda.colSpan = 5;
      fila.append(celda);
      tablaMisTareas.replaceChildren(fila);
    };

    try {
      const mias = await GearTask.api('GET', '/tareas/mias');
      if (mias.length === 0) {
        mensajeFila('No tienes tareas asignadas por ahora.', 'text-white-50');
        return;
      }
      tablaMisTareas.replaceChildren();
      mias.forEach((tarea) => {
        const fila = crearElemento('tr');
        const celdaProyecto = crearElemento('td');
        celdaProyecto.append(
          crearElemento('span', 'badge bg-warning text-dark', tarea.workspace ? tarea.workspace.codigo : '')
        );
        const celdaRol = crearElemento('td');
        celdaRol.append(crearElemento('span', 'badge bg-info text-dark', tarea.rolRequerido));
        const [etiqueta, clase] = ESTADOS_TAREA[tarea.estado] || [tarea.estado, 'bg-secondary'];
        const celdaEstado = crearElemento('td');
        celdaEstado.append(crearElemento('span', `badge ${clase}`, etiqueta));

        fila.append(
          celdaProyecto,
          crearElemento('td', 'fw-semibold', tarea.titulo),
          celdaRol,
          crearElemento('td', '', tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString('es-MX') : 'Sin fecha'),
          celdaEstado
        );
        tablaMisTareas.append(fila);
      });
    } catch (error) {
      mensajeFila(error.message, 'text-danger');
    }
  }

  cargarMisTareas();
});
