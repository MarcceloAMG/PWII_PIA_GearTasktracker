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