// Pantallas privadas: sin sesión se manda al login. Las públicas son la principal, el login y el registro.
(function protegerPantallas() {
  const PUBLICAS = ['PaginaPrincipal.html', 'login.html', 'registro.html'];
  const archivo = window.location.pathname.split('/').pop();
  if (!archivo.endsWith('.html') || PUBLICAS.includes(archivo)) return;

  let token = null;
  try {
    token = localStorage.getItem('geartask_token');
  } catch {
    // sin almacenamiento: se trata como sin sesión
  }
  if (!token) window.location.replace('login.html');
})();

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');

  if (loader) {
    const MIN_DISPLAY_MS = 200;

    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), MIN_DISPLAY_MS);
    });

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      const isInternalPage = href && !href.startsWith('http') && !href.startsWith('#');

      if (isInternalPage) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          loader.classList.remove('hide');
          setTimeout(() => {
            window.location.href = href;
          }, MIN_DISPLAY_MS);
        });
      }
    });
  }

  // Mostrar/ocultar contraseña
  document.querySelectorAll('.auth-toggle-pass').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const icon = btn.querySelector('i');
      const isHidden = input.type === 'password';

      input.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('bi-eye-fill', !isHidden);
      icon.classList.toggle('bi-eye-slash-fill', isHidden);
    });
  });

  // textos que aparecen al pasar el mouse
  document.querySelectorAll('[title]').forEach((el) => {
    new bootstrap.Tooltip(el);
  });
});
