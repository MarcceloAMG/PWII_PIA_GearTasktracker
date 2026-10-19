document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  const formAjustes = document.getElementById('formAjustes');
  if (formAjustes) {
    formAjustes.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.reload();
    });
  }

  const switchVersion = document.getElementById('switchVersion');
  if (switchVersion) {
    switchVersion.addEventListener('change', () => {
      window.location.reload();
    });
  }

  // CREACIÓN DE PROYECTO Y MIEMBROS POR USUARIO
  const btnBuscarUsuario = document.getElementById('btnBuscarUsuario');
  const inputBuscarUsuario = document.getElementById('inputBuscarUsuario');
  const listaChipsMiembros = document.getElementById('listaChipsMiembros');
  const formNuevoProyecto = document.getElementById('formNuevoProyecto');
  const gridProyectos = document.getElementById('gridProyectos');

  let miembrosAgregados = [];

  if (btnBuscarUsuario) {
    btnBuscarUsuario.addEventListener('click', () => {
      const query = inputBuscarUsuario.value.trim();
      if (!query) return;

      if (!miembrosAgregados.includes(query)) {
        miembrosAgregados.push(query);
        renderChips();
        inputBuscarUsuario.value = '';
      }
    });
  }

  function renderChips() {
    if (!listaChipsMiembros) return;
    listaChipsMiembros.innerHTML = `
      <span class="badge bg-secondary p-2 d-flex align-items-center gap-2">
        <i class="bi bi-person-circle"></i> Tú (Creador)
      </span>
    `;
    miembrosAgregados.forEach(user => {
      listaChipsMiembros.innerHTML += `
        <span class="badge bg-warning text-dark p-2 d-flex align-items-center gap-2">
          <i class="bi bi-person-fill"></i> ${user}
        </span>
      `;
    });
  }

  if (formNuevoProyecto) {
    formNuevoProyecto.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('tituloProyecto').value;
      const desc = document.getElementById('descProyecto').value;

      const newCol = document.createElement('div');
      newCol.className = 'col-12 col-md-6 col-lg-4';
      newCol.innerHTML = `
        <div class="project-card p-4 rounded-4 shadow h-100 d-flex flex-column justify-content-between" onclick="window.location.href='DetalleProyecto.html?id=${encodeURIComponent(titulo)}'">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-warning text-dark fw-bold">NUEVO</span>
              <small class="text-white-50"><i class="bi bi-people-fill me-1"></i>${miembrosAgregados.length + 1} Miembros</small>
            </div>
            <h4 class="text-white fw-bold mb-2">${titulo}</h4>
            <p class="text-white-50 small mb-3 text-truncate-3">${desc}</p>
          </div>
          <div class="pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
            <span class="text-white-50 small">Creado: Hoy</span>
            <span class="btn-link text-warning fw-semibold text-decoration-none small">Ver Tablero <i class="bi bi-arrow-right"></i></span>
          </div>
        </div>
      `;

      if (gridProyectos) gridProyectos.prepend(newCol);

      const modalEl = document.getElementById('modalNuevoProyecto');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      formNuevoProyecto.reset();
      miembrosAgregados = [];
      renderChips();
    });
  }
});