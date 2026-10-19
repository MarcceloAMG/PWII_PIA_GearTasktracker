document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const formRegistro = document.getElementById('formRegistro');
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

  if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // ESPACIO PARA VALIDACIONES FUTURAS (Registro, PHP, JSON)

      navegarConLoader('AreaTrabajo.html');
    });
  }
});