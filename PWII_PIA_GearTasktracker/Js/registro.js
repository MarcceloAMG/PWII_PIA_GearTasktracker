document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const formRegistro = document.getElementById('formRegistro');
  const cajaError = document.getElementById('registroError');
  const MIN_DISPLAY_MS = 200;
  const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB, igual que en el servidor

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
    cajaError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const ocultarError = () => {
    cajaError.textContent = '';
    cajaError.classList.add('d-none');
  };

  // Devuelve un mensaje si algo está mal, o null si todo está bien
  const validarCampos = (datos, foto) => {
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(datos.usuario)) {
      return 'El usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -';
    }
    if (!/^\d{10}$/.test(datos.telefono)) {
      return 'El teléfono debe tener 10 dígitos';
    }
    if (foto && foto.size > TAMANO_MAXIMO_FOTO) {
      return 'La foto no puede pasar de 2 MB';
    }
    return null;
  };

  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      ocultarError();

      const datos = {
        nombreCompleto: document.getElementById('regNombre').value.trim(),
        usuario: document.getElementById('regUsuario').value.trim(),
        correo: document.getElementById('regCorreo').value.trim(),
        password: document.getElementById('regPass').value,
        telefono: document.getElementById('regTelefono').value.trim(),
        rol: document.getElementById('regRol').value,
      };
      const foto = document.getElementById('regFoto').files[0];

      const problema = validarCampos(datos, foto);
      if (problema) {
        mostrarError(problema);
        return;
      }

      // FormData porque la foto viaja como archivo
      const formulario = new FormData();
      Object.entries(datos).forEach(([campo, valor]) => formulario.append(campo, valor));
      if (foto) formulario.append('foto', foto);

      const boton = formRegistro.querySelector('button[type="submit"]');
      boton.disabled = true;

      try {
        const respuesta = await GearTask.api('POST', '/auth/registro', formulario);

        GearTask.guardarSesion(respuesta.token, respuesta.usuario);
        navegarConLoader('AreaTrabajo.html');
      } catch (error) {
        mostrarError(error.message);
        boton.disabled = false;
      }
    });
  }
});
