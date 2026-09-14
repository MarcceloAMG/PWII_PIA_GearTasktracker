document.addEventListener('DOMContentLoaded', () => {
  const switchVersion = document.getElementById('switchVersion');
  const btnVistaLista = document.getElementById('btnVistaLista');
  const btnVistaGrafica = document.getElementById('btnVistaGrafica');
  const iconoCandadoGrafica = document.getElementById('iconoCandadoGrafica');
  const badgePlanBasico = document.getElementById('badgePlanBasico');

  const vistaLista = document.getElementById('vistaLista');
  const vistaGrafica = document.getElementById('vistaGrafica');
  
  const tituloIncidencia = document.getElementById('tituloIncidencia');
  const botonesIncidencia = document.querySelectorAll('[data-incidencia]');
  const contenedorBarras = document.getElementById('contenedorBarras');

  let estadoApp = {
    planPremium: false,
    vistaActual: 'lista', // 'lista' | 'grafica'
    // Estructura lista para sustituir con respuestas JSON de la API REST
    incidencias: {
      'FALTA DE TIEMPO': [70, 40, 90, 30, 60, 85, 50, 75, 95, 20, 45, 65],
      'MATERIAL INSUFICIENTE': [30, 85, 45, 60, 25, 40, 90, 30, 50, 80, 60, 35]
    }
  };

  // Alternar Plan (Básico <-> Premium) desde el Modal
  switchVersion.addEventListener('change', (e) => {
    estadoApp.planPremium = e.target.checked;
    actualizarPermisosPlan();
  });

  function actualizarPermisosPlan() {
    if (estadoApp.planPremium) {
      // Desbloquear botón Gráficas
      btnVistaGrafica.classList.remove('disabled');
      iconoCandadoGrafica.classList.add('d-none');
      btnVistaGrafica.title = "Ver métricas gráficas";
      if (badgePlanBasico) {
        badgePlanBasico.textContent = "Premium";
        badgePlanBasico.className = "badge bg-warning text-dark";
      }
    } else {
      btnVistaGrafica.classList.add('disabled');
      iconoCandadoGrafica.classList.remove('d-none');
      btnVistaGrafica.title = "Disponible en Plan Premium";
      if (badgePlanBasico) {
        badgePlanBasico.textContent = "Básico";
        badgePlanBasico.className = "badge bg-secondary";
      }

      if (estadoApp.vistaActual === 'grafica') {
        cambiarVista('lista');
      }
    }
  }

  // Control de cambio de vistas mediante los botones nav
  btnVistaLista.addEventListener('click', () => cambiarVista('lista'));
  btnVistaGrafica.addEventListener('click', () => {
    if (estadoApp.planPremium) cambiarVista('grafica');
  });

  function cambiarVista(vistaTarget) {
    estadoApp.vistaActual = vistaTarget;

    if (vistaTarget === 'lista') {
      btnVistaLista.classList.add('active');
      btnVistaGrafica.classList.remove('active');

      vistaGrafica.classList.add('d-none');
      vistaGrafica.classList.remove('d-flex');
      
      vistaLista.classList.remove('d-none');
      vistaLista.classList.add('d-flex');
    } else if (vistaTarget === 'grafica' && estadoApp.planPremium) {
      btnVistaGrafica.classList.add('active');
      btnVistaLista.classList.remove('active');

      vistaLista.classList.add('d-none');
      vistaLista.classList.remove('d-flex');

      vistaGrafica.classList.remove('d-none');
      vistaGrafica.classList.add('d-flex');
    }
  }

  // Selección de categoría de Incidencia (Sidebar Premium)
  botonesIncidencia.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesIncidencia.forEach(b => b.classList.remove('active'));
      boton.classList.add('active');

      const tipo = boton.getAttribute('data-incidencia');
      tituloIncidencia.textContent = `Frecuencia Mensual: ${tipo}`;
      renderizarGrafica(tipo);
    });
  });

  // Función preparada para consumir datos del backend
  function renderizarGrafica(tipoIncidencia) {
    const valores = estadoApp.incidencias[tipoIncidencia];
    if (valores && contenedorBarras) {
      const barras = contenedorBarras.querySelectorAll('.bar-fill');
      barras.forEach((barra, index) => {
        barra.style.height = `${valores[index]}%`;
      });
    }
  }
});