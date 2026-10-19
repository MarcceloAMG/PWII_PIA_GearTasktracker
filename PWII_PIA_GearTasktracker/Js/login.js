document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const formLogin = document.getElementById('formLogin');
  const cajaError = document.getElementById('loginError');
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

  const mostrarError = (mensaje) => {
    cajaError.textContent = mensaje;
    cajaError.classList.remove('d-none');
  };

  const ocultarError = () => {
    cajaError.textContent = '';
    cajaError.classList.add('d-none');
  };

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      ocultarError();

      const boton = formLogin.querySelector('button[type="submit"]');
      boton.disabled = true;

      try {
        const datos = await GearTask.api('POST', '/auth/login', {
          correo: document.getElementById('loginCorreo').value.trim(),
          password: document.getElementById('loginPass').value,
        });

        GearTask.guardarSesion(datos.token, datos.usuario);
        navegarConLoader('AreaTrabajo.html');
      } catch (error) {
        mostrarError(error.message);
        boton.disabled = false;
      }
    });
  }
});
