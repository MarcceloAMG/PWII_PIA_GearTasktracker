document.addEventListener('DOMContentLoaded', () => {
  const switchVersion = document.getElementById('switchVersion');
  const monthItems = document.querySelectorAll('.month-item');
  const tituloMes = document.getElementById('tituloMes');
  const badgePlan = document.getElementById('badgePlan');
  const vistaGrafica = document.getElementById('vistaGrafica');
  const vistaVacia = document.getElementById('vistaVacia');

  actualizarEstadoPlan(false);

  switchVersion.addEventListener('change', (e) => {
    const esPremium = e.target.checked;
    actualizarEstadoPlan(esPremium);
  });

  function actualizarEstadoPlan(esPremium) {
    if (esPremium) {
      badgePlan.textContent = 'Premium';
      badgePlan.className = 'badge bg-warning text-dark';
      
      // Desbloquear todos los meses y quita íconos de candado
      monthItems.forEach(item => {
        item.classList.remove('disabled');
        const lock = item.querySelector('.lock-icon');
        if (lock) lock.classList.add('d-none');
      });
    } else {
      badgePlan.textContent = 'Básico';
      badgePlan.className = 'badge bg-secondary';

      // Bloquear meses salvo Septiembre (Mes actual)
      monthItems.forEach(item => {
        const mes = item.getAttribute('data-month');
        const lock = item.querySelector('.lock-icon');
        
        if (mes !== 'Septiembre') {
          item.classList.add('disabled');
          if (lock) lock.classList.remove('d-none');
        } else {
          item.click(); // Regresa automáticamente a Septiembre al volver a Básico
        }
      });
    }
  }

  // Selección de Meses
  monthItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('disabled')) return;

      monthItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');

      const mesSeleccionado = item.getAttribute('data-month');
      tituloMes.textContent = `Métricas de Productividad - ${mesSeleccionado}`;

      if (mesSeleccionado === 'Septiembre') {
        vistaGrafica.classList.remove('d-none');
        vistaVacia.classList.add('d-none');
      } else {
        vistaGrafica.classList.add('d-none');
        vistaVacia.classList.remove('d-none');
      }
    });
  });
});