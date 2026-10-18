document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const formRegistro = document.getElementById('formRegistro');
  
  const inputFoto = document.getElementById('regFoto');
  const inputNombre = document.getElementById('regNombre');
  const inputUsuario = document.getElementById('regUsuario');
  const inputCorreo = document.getElementById('regCorreo');
  const inputPass = document.getElementById('regPass');
  const inputTelefono = document.getElementById('regTelefono');
  const selectRol = document.getElementById('regRol');
  const MIN_DISPLAY_MS = 200; 

  const navegarConLoader = (url) => {
    if (loader) {
      loader.classList.remove('hide');
      setTimeout(() => {
        window.location.href = url;
      }, MIN_DISPLAY_MS);
    } else {
      window.location.href = url;
    }
  };

  const mostrarErrorCampo = (inputElement, mensaje) => {
    borrarErrorCampo(inputElement);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.innerText = mensaje;
    inputElement.closest('.mb-3, .mb-4').appendChild(errorDiv);
  };

  const borrarErrorCampo = (inputElement) => {
    const contenedor = inputElement.closest('.mb-3, .mb-4');
    const errorExistente = contenedor.querySelector('.field-error-message');
    if (errorExistente) {
      errorExistente.remove();
    }
  };

  // Modal de confirmación para "Sin experiencia previa" 
  const confirmarSinExperiencia = (onConfirm) => {
    if (document.querySelector('.custom-alert-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const box = document.createElement('div');
    box.className = 'custom-alert-box default';

    const titleElem = document.createElement('div');
    titleElem.className = 'custom-alert-title';
    titleElem.innerText = 'Aviso';

    const msgElem = document.createElement('div');
    msgElem.className = 'custom-alert-message';
    msgElem.innerText = '¿De verdad desea continuar sin haber seleccionado experiencia previa?';

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.gap = '10px';
    btnContainer.style.marginTop = '15px';

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'custom-alert-btn';
    btnCancelar.style.backgroundColor = '#6b7280';
    btnCancelar.innerText = 'Cancelar';
    btnCancelar.onclick = function () {
        document.body.removeChild(overlay);
    };

    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'custom-alert-btn';
    btnAceptar.innerText = 'Aceptar';
    btnAceptar.onclick = function () {
        document.body.removeChild(overlay);
        onConfirm();
    };

    btnContainer.appendChild(btnCancelar);
    btnContainer.appendChild(btnAceptar);

    box.appendChild(titleElem);
    box.appendChild(msgElem);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  };

  
  // --- VALIDACIONES EN TIEMPO REAL ---

  if (inputFoto) {
    inputFoto.addEventListener('change', () => {
      if (inputFoto.files.length > 0) {
        borrarErrorCampo(inputFoto);
      } else {
        mostrarErrorCampo(inputFoto, 'No pueden dejarse los campos vacíos');
      }
    });
  }

  if (inputNombre) {
    inputNombre.addEventListener('input', () => {
      const valor = inputNombre.value.trim();
      const soloLetras = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
      const palabras = valor.split(/\s+/).filter(Boolean);
      const tienePalabraCorta = palabras.some(p => p.length < 3);

      if (!valor) {
        mostrarErrorCampo(inputNombre, 'No pueden dejarse los campos vacíos');
      } else if (!soloLetras) {
        mostrarErrorCampo(inputNombre, 'Solo se permiten letras');
      } else if (palabras.length < 2 || tienePalabraCorta) {
        mostrarErrorCampo(inputNombre, 'Nombre y apellido deben tener mínimo 3 letras cada uno');
      } else {
        borrarErrorCampo(inputNombre);
      }
    });
  }

  if (inputUsuario) {
    inputUsuario.addEventListener('input', () => {
      const valor = inputUsuario.value.trim();
      if (!valor) {
        mostrarErrorCampo(inputUsuario, 'No pueden dejarse los campos vacíos');
      } else if (valor.length < 3) {
        mostrarErrorCampo(inputUsuario, 'El nombre de usuario debe tener al menos 3 letras');
      } else {
        borrarErrorCampo(inputUsuario);
      }
    });
  }

  if (inputCorreo) {
    inputCorreo.addEventListener('input', () => {
      const valor = inputCorreo.value.trim();
      if (!valor) {
        mostrarErrorCampo(inputCorreo, 'No pueden dejarse los campos vacíos');
      } else if (!valor.endsWith('@gmail.com') && !valor.endsWith('@yahoo.com')) {
        mostrarErrorCampo(inputCorreo, 'El correo debe tener terminación @gmail.com o @yahoo.com');
      } else {
        borrarErrorCampo(inputCorreo);
      }
    });
  }

  if (inputPass) {
    inputPass.addEventListener('input', () => {
      const valor = inputPass.value;
      if (!valor) {
        mostrarErrorCampo(inputPass, 'No pueden dejarse los campos vacíos');
      } else if (valor.length < 8) {
        mostrarErrorCampo(inputPass, 'La contraseña debe tener al menos 8 caracteres');
      } else {
        borrarErrorCampo(inputPass);
      }
    });
  }

  if (inputTelefono) {
    inputTelefono.addEventListener('input', () => {
      const valor = inputTelefono.value.trim();
      const regexTelefono = /^\d{10}$/;
      if (!valor) {
        mostrarErrorCampo(inputTelefono, 'No pueden dejarse los campos vacíos');
      } else if (!regexTelefono.test(valor)) {
        mostrarErrorCampo(inputTelefono, 'El número de teléfono debe ser de exactamente 10 dígitos');
      } else {
        borrarErrorCampo(inputTelefono);
      }
    });
  }

  // --- VALIDACIÓN AL ENVIAR FORMULARIO ---
  if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      let esValido = true;

      if (!inputFoto.files || inputFoto.files.length === 0) {
        mostrarErrorCampo(inputFoto, 'No pueden dejarse los campos vacíos');
        esValido = false;
      }

      const valNombre = inputNombre.value.trim();
      const soloLetrasEnvio = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(valNombre);
      const palabrasEnvio = valNombre.split(/\s+/).filter(Boolean);
      const tienePalabraCortaEnvio = palabrasEnvio.some(p => p.length < 3);

      if (!valNombre) {
        mostrarErrorCampo(inputNombre, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!soloLetrasEnvio) {
        mostrarErrorCampo(inputNombre, 'Solo se permiten letras');
        esValido = false;
      } else if (palabrasEnvio.length < 2 || tienePalabraCortaEnvio) {
        mostrarErrorCampo(inputNombre, 'Nombre y apellido deben tener mínimo 3 letras cada uno');
        esValido = false;
      }

      const valUsuario = inputUsuario.value.trim();
      if (!valUsuario) {
        mostrarErrorCampo(inputUsuario, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (valUsuario.length < 3) {
        mostrarErrorCampo(inputUsuario, 'El nombre de usuario debe tener al menos 3 letras');
        esValido = false;
      }

      const valCorreo = inputCorreo.value.trim();
      if (!valCorreo) {
        mostrarErrorCampo(inputCorreo, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!valCorreo.endsWith('@gmail.com') && !valCorreo.endsWith('@yahoo.com')) {
        mostrarErrorCampo(inputCorreo, 'El correo debe tener terminación @gmail.com o @yahoo.com');
        esValido = false;
      }

      const valPass = inputPass.value;
      if (!valPass) {
        mostrarErrorCampo(inputPass, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (valPass.length < 8) {
        mostrarErrorCampo(inputPass, 'La contraseña debe tener al menos 8 caracteres');
        esValido = false;
      }

      const valTel = inputTelefono.value.trim();
      const regexTelefono = /^\d{10}$/;
      if (!valTel) {
        mostrarErrorCampo(inputTelefono, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!regexTelefono.test(valTel)) {
        mostrarErrorCampo(inputTelefono, 'El número de teléfono debe ser de exactamente 10 dígitos');
        esValido = false;
      }

      if (!esValido) return;

      const procederExito = () => {
        alertaExito("¡Registro exitoso!", () => {
          navegarConLoader('AreaTrabajo.php');
        });
      };

      if (selectRol && selectRol.value === 'Sin experiencia previa') {
        confirmarSinExperiencia(procederExito);
      } else {
        procederExito();
      }
    });
  }
});