document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const formLogin = document.getElementById('formLogin');
  const inputCorreo = document.getElementById('loginCorreo');
  const inputPass = document.getElementById('loginPass');
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

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let esValido = true;
      const valorCorreo = inputCorreo.value.trim();
      const valorPass = inputPass.value;

      if (!valorCorreo) {
        mostrarErrorCampo(inputCorreo, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (!valorCorreo.endsWith('@gmail.com') && !valorCorreo.endsWith('@yahoo.com')) {
        mostrarErrorCampo(inputCorreo, 'El correo debe tener terminación @gmail.com o @yahoo.com');
        esValido = false;
      }

      if (!valorPass) {
        mostrarErrorCampo(inputPass, 'No pueden dejarse los campos vacíos');
        esValido = false;
      } else if (valorPass.length < 8) {
        mostrarErrorCampo(inputPass, 'La contraseña debe tener al menos 8 caracteres');
        esValido = false;
      }

      if (!esValido) return;

      alertaExito("¡Inicio de sesión exitoso!", () => {
        navegarConLoader('AreaTrabajo.php');
      });
    });
  }
});