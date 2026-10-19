document.addEventListener('DOMContentLoaded', () => {
  const btnVistaLista = document.getElementById('btnVistaLista');
  const btnVistaGrafica = document.getElementById('btnVistaGrafica');
  const iconoCandadoGrafica = document.getElementById('iconoCandadoGrafica');
  const badgePlanBasico = document.getElementById('badgePlanBasico');

  const vistaLista = document.getElementById('vistaLista');
  const vistaGrafica = document.getElementById('vistaGrafica');
  const contenedorLista = document.getElementById('contenedorReportesLista');

  const tituloIncidencia = document.getElementById('tituloIncidencia');
  const botonesIncidencia = document.querySelectorAll('[data-incidencia]');
  const contenedorBarras = document.getElementById('contenedorBarras');

  const COLORES_MOTIVO = {
    'FALTA DE TIEMPO': 'bg-danger',
    'MATERIAL INSUFICIENTE': 'bg-warning text-dark',
    ENFERMEDAD: 'bg-info text-dark',
    OTRO: 'bg-secondary',
  };

  const estadoApp = {
    planPremium: false,
    vistaActual: 'lista', // 'lista' | 'grafica'
    motivo: 'FALTA DE TIEMPO',
    estadisticas: null, // { anio, total, motivos: { MOTIVO: [12 valores] } }
  };

  // Todo lo que viene del servidor se inserta con textContent (nunca como HTML)
  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  // ---- Lista de reportes (básico y Premium) -----------------------------------

  function abrirDetalle(reporte) {
    const usuario = reporte.usuario ? reporte.usuario.usuario : 'Usuario';
    const tarea = reporte.tarea ? reporte.tarea.titulo : 'una tarea';
    const proyecto = reporte.workspace ? reporte.workspace.titulo : '';

    document.getElementById('usuarioModalReporte').textContent = usuario;
    const motivo = document.getElementById('motivoModalReporte');
    motivo.textContent = reporte.motivo;
    motivo.className = `badge ${COLORES_MOTIVO[reporte.motivo] || 'bg-secondary'}`;
    document.getElementById('contextoModalReporte').textContent =
      `Tarea "${tarea}" · Proyecto ${proyecto} · ${new Date(reporte.fecha).toLocaleDateString('es-MX')}`;
    document.getElementById('descripcionModalReporte').textContent = reporte.descripcion;
    document.getElementById('avatarModalReporte').src = GearTask.urlFoto(
      reporte.usuario && reporte.usuario.foto
    );
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalReporte')).show();
  }

  function crearTarjeta(reporte) {
    const tarjeta = crearElemento(
      'div',
      'notif-card p-3 rounded-4 shadow d-flex align-items-center justify-content-between'
    );
    tarjeta.style.cursor = 'pointer';
    tarjeta.addEventListener('click', () => abrirDetalle(reporte));

    const izquierda = crearElemento('div', 'd-flex align-items-center gap-3 me-3 overflow-hidden');
    const imagen = crearElemento('img', 'notif-avatar');
    imagen.src = GearTask.urlFoto(reporte.usuario && reporte.usuario.foto);
    imagen.alt = 'Foto perfil';

    const usuario = reporte.usuario ? reporte.usuario.usuario : 'Un integrante';
    const tarea = reporte.tarea ? reporte.tarea.titulo : 'una tarea';
    const texto = crearElemento('div', 'text-truncate');
    texto.append(
      crearElemento('span', `badge ${COLORES_MOTIVO[reporte.motivo] || 'bg-secondary'} mb-1`, reporte.motivo),
      crearElemento('p', 'mb-0 fw-medium text-white text-truncate', `${usuario} no pudo cumplir "${tarea}"`)
    );

    izquierda.append(imagen, texto);
    tarjeta.append(izquierda, crearElemento('i', 'bi bi-chevron-right text-white fs-5 flex-shrink-0'));
    return tarjeta;
  }

  async function cargarLista() {
    try {
      const reportes = await GearTask.api('GET', '/reportes');
      contenedorLista.replaceChildren();
      if (reportes.length === 0) {
        contenedorLista.append(
          crearElemento('p', 'text-dark', 'Todavía no has recibido reportes de incumplimiento.')
        );
        return;
      }
      reportes.forEach((reporte) => contenedorLista.append(crearTarjeta(reporte)));
    } catch (error) {
      contenedorLista.replaceChildren(crearElemento('p', 'text-danger', error.message));
    }
  }

  // ---- Plan y vistas ---------------------------------------------------------

  function actualizarPermisosPlan() {
    if (estadoApp.planPremium) {
      btnVistaGrafica.classList.remove('disabled');
      iconoCandadoGrafica.classList.add('d-none');
      btnVistaGrafica.title = 'Ver métricas gráficas';
      badgePlanBasico.textContent = 'Premium';
      badgePlanBasico.className = 'badge bg-warning text-dark';
    } else {
      btnVistaGrafica.classList.add('disabled');
      iconoCandadoGrafica.classList.remove('d-none');
      btnVistaGrafica.title = 'Disponible en Plan Premium';
      badgePlanBasico.textContent = 'Básico';
      badgePlanBasico.className = 'badge bg-secondary';
      estadoApp.estadisticas = null;

      if (estadoApp.vistaActual === 'grafica') cambiarVista('lista');
    }
  }

  btnVistaLista.addEventListener('click', () => cambiarVista('lista'));
  btnVistaGrafica.addEventListener('click', () => {
    if (estadoApp.planPremium) cambiarVista('grafica');
  });

  function cambiarVista(destino) {
    estadoApp.vistaActual = destino;

    if (destino === 'lista') {
      btnVistaLista.classList.add('active');
      btnVistaGrafica.classList.remove('active');
      vistaGrafica.classList.add('d-none');
      vistaGrafica.classList.remove('d-flex');
      vistaLista.classList.remove('d-none');
      vistaLista.classList.add('d-flex');
    } else if (destino === 'grafica' && estadoApp.planPremium) {
      btnVistaGrafica.classList.add('active');
      btnVistaLista.classList.remove('active');
      vistaLista.classList.add('d-none');
      vistaLista.classList.remove('d-flex');
      vistaGrafica.classList.remove('d-none');
      vistaGrafica.classList.add('d-flex');
      cargarEstadisticas();
    }
  }

  // ---- Gráfica de incidencias (Premium) ----------------------------------------

  async function cargarEstadisticas() {
    try {
      estadoApp.estadisticas = await GearTask.api('GET', '/reportes/estadisticas');
      document.getElementById('etiquetaAnio').textContent = `Año ${estadoApp.estadisticas.anio}`;
      renderizarGrafica(estadoApp.motivo);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function renderizarGrafica(motivo) {
    if (!estadoApp.estadisticas) return;
    const valores = estadoApp.estadisticas.motivos[motivo] || Array(12).fill(0);
    const maximo = Math.max(1, ...valores);
    const total = valores.reduce((suma, valor) => suma + valor, 0);

    contenedorBarras.querySelectorAll('.bar-item').forEach((barra, indice) => {
      barra.querySelector('.bar-fill').style.height = `${(valores[indice] / maximo) * 100}%`;
      barra.title = `${barra.dataset.mes}: ${valores[indice]} reporte(s)`;
    });
    document.getElementById('resumenIncidencia').textContent =
      `${total} reporte(s) por ${motivo} en el año. Máximo en un mes: ${Math.max(...valores)}.`;
  }

  botonesIncidencia.forEach((boton) => {
    boton.addEventListener('click', () => {
      botonesIncidencia.forEach((b) => b.classList.remove('active'));
      boton.classList.add('active');

      estadoApp.motivo = boton.getAttribute('data-incidencia');
      tituloIncidencia.textContent = `Frecuencia Mensual: ${estadoApp.motivo}`;
      renderizarGrafica(estadoApp.motivo);
    });
  });

  GearTask.enlazarSwitchPlan((plan) => {
    estadoApp.planPremium = plan === 'premium';
    actualizarPermisosPlan();
  });
  cargarLista();
});
