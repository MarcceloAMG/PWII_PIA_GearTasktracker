document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  const mostrarErrorCampo = (element, mensaje) => {
    borrarErrorCampo(element);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.innerText = mensaje;

    const inputGroup = element.closest('.input-group');
    if (inputGroup) {
      inputGroup.parentNode.insertBefore(errorDiv, inputGroup.nextSibling);
    } else {
      const contenedor = element.closest('.mb-2, .mb-3, .mb-4');
      if (contenedor) {
        contenedor.appendChild(errorDiv);
      } else {
        element.parentNode.appendChild(errorDiv);
      }
    }
  };

  const borrarErrorCampo = (element) => {
    const inputGroup = element.closest('.input-group');
    if (inputGroup && inputGroup.parentNode) {
      const errorEnGrupo = inputGroup.parentNode.querySelector('.field-error-message');
      if (errorEnGrupo) errorEnGrupo.remove();
    }

    const contenedor = element.closest('.mb-2, .mb-3, .mb-4');
    if (contenedor) {
      const errorExistente = contenedor.querySelector('.field-error-message');
      if (errorExistente) errorExistente.remove();
    }
  };

  const formAjustes = document.getElementById('formAjustes');
  const inputNuevoUsuario = document.getElementById('nuevoUsuario');
  const inputNuevaPass = document.getElementById('nuevaPass');

  if (inputNuevoUsuario) {
    inputNuevoUsuario.addEventListener('input', () => {
      const valor = inputNuevoUsuario.value.trim();
      if (!valor) {
        mostrarErrorCampo(inputNuevoUsuario, 'No pueden dejarse los campos vacíos');
      } else if (valor.length < 3) {
        mostrarErrorCampo(inputNuevoUsuario, 'El nombre de usuario debe tener al menos 3 caracteres');
      } else {
        borrarErrorCampo(inputNuevoUsuario);
      }
    });
  }

  if (inputNuevaPass) {
    inputNuevaPass.addEventListener('input', () => {
      const valor = inputNuevaPass.value;
      if (!valor) {
        mostrarErrorCampo(inputNuevaPass, 'No pueden dejarse los campos vacíos');
      } else if (valor.length < 8) {
        mostrarErrorCampo(inputNuevaPass, 'La contraseña debe tener al menos 8 caracteres');
      } else {
        borrarErrorCampo(inputNuevaPass);
      }
    });
  }

  if (formAjustes) {
    formAjustes.addEventListener('submit', (e) => {
      e.preventDefault();
      let esValido = true;

      const valUser = inputNuevoUsuario ? inputNuevoUsuario.value.trim() : '';
      const valPass = inputNuevaPass ? inputNuevaPass.value : '';

      if (!valUser) {
        mostrarErrorCampo(inputNuevoUsuario, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (valUser.length < 3) {
        mostrarErrorCampo(inputNuevoUsuario, 'El nombre de usuario debe tener al menos 3 caracteres');
        esValido = false;
      }

      if (!valPass) {
        mostrarErrorCampo(inputNuevaPass, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (valPass.length < 8) {
        mostrarErrorCampo(inputNuevaPass, 'La contraseña debe tener al menos 8 caracteres');
        esValido = false;
      }

      if (!esValido) return;
      window.location.reload();
    });
  }

  const switchVersion = document.getElementById('switchVersion');
  if (switchVersion) {
    switchVersion.addEventListener('change', () => {
      window.location.reload();
    });
  }

  // --- CREACIÓN DE PROYECTO Y MIEMBROS ---
  const btnBuscarUsuario = document.getElementById('btnBuscarUsuario');
  const inputBuscarUsuario = document.getElementById('inputBuscarUsuario');
  const listaChipsMiembros = document.getElementById('listaChipsMiembros');
  const formNuevoProyecto = document.getElementById('formNuevoProyecto');
  const gridProyectos = document.getElementById('gridProyectos');
  const inputTituloProyecto = document.getElementById('tituloProyecto');
  const inputDescProyecto = document.getElementById('descProyecto');

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

  if (inputTituloProyecto) {
    inputTituloProyecto.addEventListener('input', () => {
      const valor = inputTituloProyecto.value.trim();
      const empiezaConLetra = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(valor);
      const formatoValido = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s]*$/.test(valor);

      if (!valor) {
        mostrarErrorCampo(inputTituloProyecto, 'No pueden dejarse los campos vacíos');
      } else if (!empiezaConLetra || !formatoValido) {
        mostrarErrorCampo(inputTituloProyecto, 'El título debe comenzar con letras antes de usar números');
      } else if (valor.length < 5) {
        mostrarErrorCampo(inputTituloProyecto, 'El título debe tener al menos 5 caracteres');
      } else {
        borrarErrorCampo(inputTituloProyecto);
      }
    });
  }

  if (inputDescProyecto) {
    inputDescProyecto.addEventListener('input', () => {
      const valor = inputDescProyecto.value.trim();
      const empiezaConTexto = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(valor);
      const formatoValido = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s.,;:!?-_]*$/.test(valor);

      if (!valor) {
        mostrarErrorCampo(inputDescProyecto, 'No pueden dejarse los campos vacíos');
      } else if (!empiezaConTexto || !formatoValido) {
        mostrarErrorCampo(inputDescProyecto, 'La descripción debe comenzar estrictamente con texto (letras)');
      } else if (valor.length < 15) {
        mostrarErrorCampo(inputDescProyecto, 'La descripción debe tener al menos 15 caracteres');
      } else {
        borrarErrorCampo(inputDescProyecto);
      }
    });
  }

  if (formNuevoProyecto) {
    formNuevoProyecto.addEventListener('submit', (e) => {
      e.preventDefault();
      let esValido = true;

      const titulo = inputTituloProyecto ? inputTituloProyecto.value.trim() : '';
      const desc = inputDescProyecto ? inputDescProyecto.value.trim() : '';

      const empiezaConLetraT = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(titulo);
      const formatoValidoT = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s]*$/.test(titulo);

      if (!titulo) {
        mostrarErrorCampo(inputTituloProyecto, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!empiezaConLetraT || !formatoValidoT) {
        mostrarErrorCampo(inputTituloProyecto, 'El título debe comenzar con letras antes de usar números');
        esValido = false;
      } else if (titulo.length < 5) {
        mostrarErrorCampo(inputTituloProyecto, 'El título debe tener al menos 5 caracteres');
        esValido = false;
      }

      const empiezaConTextoD = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(desc);
      const formatoValidoD = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s.,;:!?-_]*$/.test(desc);

      if (!desc) {
        mostrarErrorCampo(inputDescProyecto, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!empiezaConTextoD || !formatoValidoD) {
        mostrarErrorCampo(inputDescProyecto, 'La descripción debe comenzar estrictamente con texto (letras)');
        esValido = false;
      } else if (desc.length < 15) {
        mostrarErrorCampo(inputDescProyecto, 'La descripción debe tener al menos 15 caracteres');
        esValido = false;
      }

      if (!esValido) return;

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
      borrarErrorCampo(inputTituloProyecto);
      borrarErrorCampo(inputDescProyecto);
      miembrosAgregados = [];
      renderChips();
    });
  }
});