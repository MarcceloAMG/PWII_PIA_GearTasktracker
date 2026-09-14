document.addEventListener('DOMContentLoaded', () => {
  const tablaTareasProyecto = document.getElementById('tablaTareasProyecto');
  const btnAutoAsignar = document.getElementById('btnAutoAsignar');
  const formNuevaTarea = document.getElementById('formNuevaTarea');
  const btnBuscarModal = document.getElementById('btnBuscarModal');
  const resultadoBusquedaModal = document.getElementById('resultadoBusquedaModal');
  const btnConfirmarAddMiembro = document.getElementById('btnConfirmarAddMiembro');
  const listaIntegrantesProyecto = document.getElementById('listaIntegrantesProyecto');

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  if (projectId) {
    document.getElementById('lblTituloProyecto').textContent = `Proyecto: ${projectId}`;
  }

  //Asignación voluntaria y excepciones del limbo
  tablaTareasProyecto.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-tomar')) {
      const tr = e.target.closest('tr');
      const colAsignado = tr.querySelector('.col-asignado');
      const badgeEstado = tr.querySelector('.badge-estado');

      colAsignado.innerHTML = `<span class="text-warning fw-bold">Tú</span>`;
      badgeEstado.textContent = 'En Proceso';
      badgeEstado.className = 'badge bg-success badge-estado';
      e.target.remove();
    }

    if (e.target.classList.contains('btn-limbo-aprobar')) {
      const tr = e.target.closest('tr');
      tr.classList.remove('table-danger-custom');
      const badgeEstado = tr.querySelector('.badge-estado');
      badgeEstado.textContent = 'Pendiente (Excepción)';
      badgeEstado.className = 'badge bg-warning text-dark badge-estado';
      e.target.remove();
    }
  });

  // Asignación Automática Inteligente
  btnAutoAsignar.addEventListener('click', () => {
    const filasSinAsignar = tablaTareasProyecto.querySelectorAll('tr');
    
    filasSinAsignar.forEach(tr => {
      const colAsignado = tr.querySelector('.col-asignado');
      if (colAsignado && colAsignado.textContent.includes('Sin asignar')) {
        colAsignado.innerHTML = `<span class="text-info fw-bold">Ejemplo_01</span>`;
        const badgeEstado = tr.querySelector('.badge-estado');
        badgeEstado.textContent = 'Asignada (Auto)';
        badgeEstado.className = 'badge bg-info text-dark badge-estado';
      }
    });

    alert('Asignación automática inteligente completada.');
  });

  // Crear Nueva Tarea
  if (formNuevaTarea) {
    formNuevaTarea.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('tituloTarea').value;
      const rol = document.getElementById('rolTareaRequired').value;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="fw-bold text-white">${titulo}</div>
          <small class="text-white-50">Tarea creada</small>
        </td>
        <td><span class="badge bg-info text-dark">${rol}</span></td>
        <td class="col-asignado"><span class="text-white-50 italic">Sin asignar</span></td>
        <td><span class="badge bg-secondary badge-estado">Disponible</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-warning rounded-pill btn-tomar">Tomar Voluntariamente</button>
        </td>
      `;

      tablaTareasProyecto.appendChild(tr);

      const modalEl = document.getElementById('modalNuevaTarea');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      formNuevaTarea.reset();
    });
  }

  // Búsqueda y añádir miembros
  if (btnBuscarModal) {
    btnBuscarModal.addEventListener('click', () => {
      const query = document.getElementById('inputBuscarModal').value.trim();
      if (!query) return;
      document.getElementById('nombreUsuarioEncontrado').textContent = query;
      resultadoBusquedaModal.classList.remove('d-none');
    });
  }

  if (btnConfirmarAddMiembro) {
    btnConfirmarAddMiembro.addEventListener('click', () => {
      const user = document.getElementById('nombreUsuarioEncontrado').textContent;
      const div = document.createElement('div');
      div.className = 'team-member-item d-flex align-items-center gap-2 p-2 rounded-3 mb-2';
      div.innerHTML = `
        <img src="../Assets/perfil.jpg" alt="Perfil" class="team-avatar-sm rounded-circle">
        <div class="overflow-hidden">
          <span class="text-white fw-bold d-block text-truncate small">${user}</span>
          <small class="text-info d-block micro-text">Nuevo Miembro</small>
        </div>
      `;
      listaIntegrantesProyecto.appendChild(div);

      const modalEl = document.getElementById('modalAddMiembro');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      resultadoBusquedaModal.classList.add('d-none');
      document.getElementById('inputBuscarModal').value = '';
    });
  }
});