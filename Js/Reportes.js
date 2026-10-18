/* Por ahora los reportes viven solo en memoria: si se recarga la página, se borran.

   Hay 5 categorías. En la base de datos guarden la CLAVE (la de la izquierda):
      tiempo       -> FALTA DE TIEMPO
      material     -> MATERIAL INSUFICIENTE O DAÑADO
      comunicacion -> FALTA COMUNICATIVA
      bugs         -> ERRORES (BUGS)
      graves       -> FALTAS GRAVES

   Lo que hay que construir:

   1) GUARDAR un reporte  ->  función guardarReporte()
      - Crear un PHP (ej. ../PHP/guardar-reporte.php) que reciba { categoria, descripcion }.
      - El usuario que lo envía se toma de la SESIÓN en el servidor ($_SESSION),
        NUNCA de lo que mande el navegador.
      - Validar otra vez en el servidor: categoría válida
        (una de las 5 claves) y descripción no vacía, solo texto.
      - Guardar también la fecha y hora en que se levantó el reporte.

   2) CARGAR los reportes  ->  función cargarReportes()
      - Crear un PHP (ej. ../PHP/reportes.php) que devuelva una lista
        en JSON, cada reporte con esta forma:
           { "id": 1, "usuario": "Ejemplo_01", "foto": "../Assets/perfil.jpg",
             "categoria": "tiempo", "descripcion": "texto...",
             "fecha": "2026-10-17T23:45:10" }       <- fecha en formato ISO 8601
      - La MISMA lista alimenta la tarjeta de la lista Y la gráfica: la gráfica cuenta
        cuántos reportes hay por mes de cada categoría, así que NO hay que calcular
        nada aparte. Deben venir todos los reportes del año actual.

   El usuario y su foto salen de PHP: Reportes.php los pone en <body data-usuario
   data-foto>, solo hay que cambiar los valores de relleno en ese archivo. */

document.addEventListener('DOMContentLoaded', () => {
  const modalSuscripcion = document.getElementById('modalSuscripcion'); 
  const btnVistaLista = document.getElementById('btnVistaLista');
  const btnVistaGrafica = document.getElementById('btnVistaGrafica');
  const iconoCandadoGrafica = document.getElementById('iconoCandadoGrafica');
  const badgePlanBasico = document.getElementById('badgePlanBasico');

  const vistaLista = document.getElementById('vistaLista');
  const vistaGrafica = document.getElementById('vistaGrafica');

  const contenedorLista = document.getElementById('contenedorReportesLista');
  const listaVacia = document.getElementById('listaVacia');

  const tituloIncidencia = document.getElementById('tituloIncidencia');
  const contenedorFiltros = document.getElementById('contenedorFiltrosIncidencia');
  const contenedorBarras = document.getElementById('contenedorBarras');
  const graficaContenedor = document.getElementById('graficaContenedor');
  const graficaVacia = document.getElementById('graficaVacia');

  const formReporte = document.getElementById('formNuevoReporte');
  const selectCategoria = document.getElementById('categoriaReporte');
  const inputDescripcion = document.getElementById('descripcionReporte');
  const chipCategoria = document.getElementById('chipCategoria');
  const modalNuevoEl = document.getElementById('modalNuevoReporte');

  const modalDetalleEl = document.getElementById('modalDetalleReporte');
  const detalleContenido = document.getElementById('detalleContenido');

  const usuarioActual = document.body.dataset.usuario || 'Usuario';
  const fotoUsuario = document.body.dataset.foto || '../Assets/perfil.jpg';

  const CATEGORIAS = {
    tiempo: {
      nombre: 'FALTA DE TIEMPO',
      clase: 'cat-tiempo',
      frase: (u) => ['El usuario ', { b: u }, ' ha reportado un retraso por ', { b: 'FALTA DE TIEMPO' }, '.']
    },
    material: {
      nombre: 'MATERIAL INSUFICIENTE O DAÑADO',
      clase: 'cat-material',
      frase: (u) => ['El integrante ', { b: u }, ' reportó un problema de tipo ', { b: 'MATERIAL INSUFICIENTE O DAÑADO' }, '.']
    },
    comunicacion: {
      nombre: 'FALTA COMUNICATIVA',
      clase: 'cat-comunicacion',
      frase: (u) => ['El integrante ', { b: u }, ' reportó un problema de ', { b: 'FALTA COMUNICATIVA' }, '.']
    },
    bugs: {
      nombre: 'ERRORES (BUGS)',
      clase: 'cat-bugs',
      frase: (u) => ['El integrante ', { b: u }, ' reportó un gran problema de ', { b: 'ERRORES O BUGS' }, '.']
    },
    graves: {
      nombre: 'FALTAS GRAVES',
      clase: 'cat-graves',
      frase: (u) => ['El integrante ', { b: u }, ' reportó una ', { b: 'FALTA GRAVE' }, ' ya sea por usuario problemático o situación propia.']
    }
  };
  const CLASES_CATEGORIA = Object.values(CATEGORIAS).map(c => c.clase);

  const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const anioActual = new Date().getFullYear();

  /* Reportes en un mes para que su barra llegue al tope. Si un mes lo supera, la escala se ajusta sola. */
  const META_REPORTES_MES = 5;
  const MIN_CARACTERES_DESCRIPCION = 10;

  let planPremium = false;
  let vistaActual = 'lista'; 
  let categoriaActiva = 'tiempo';
  let reportes = [];

  const dos = (n) => String(n).padStart(2, '0');
  const formatoFecha = (d) => `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`; 
  const formatoHora = (d) => `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;

  function crear(etiqueta, clases = '', texto = '') {
    const el = document.createElement(etiqueta);
    if (clases) el.className = clases;
    if (texto) el.textContent = texto;
    return el;
  }

  // Todo texto del usuario se escribe con textContent (nunca como HTML), así no se puede inyectar código.
  function escribirFrase(contenedor, partes) {
    contenedor.textContent = '';
    partes.forEach(parte => {
      if (typeof parte === 'string') {
        contenedor.appendChild(document.createTextNode(parte));
      } else {
        contenedor.appendChild(crear('strong', '', parte.b));
      }
    });
  }

  const fechaHoy = document.getElementById('fechaHoy');
  const horaActual = document.getElementById('horaActual');
  document.getElementById('anioGrafica').textContent = anioActual;

  function actualizarReloj() {
    const ahora = new Date();
    fechaHoy.textContent = formatoFecha(ahora);
    horaActual.textContent = formatoHora(ahora);
  }
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  Object.entries(CATEGORIAS).forEach(([clave, cat]) => {
    const opcion = crear('option', '', cat.nombre);
    opcion.value = clave;
    selectCategoria.appendChild(opcion);

    const boton = crear('button', `month-item ${cat.clase}`);
    boton.type = 'button';
    boton.dataset.incidencia = clave;
    boton.appendChild(crear('span', '', cat.nombre));
    const chip = crear('span', 'cat-chip');
    chip.appendChild(crear('i', 'bi bi-exclamation-octagon-fill'));
    boton.appendChild(chip);
    boton.addEventListener('click', () => seleccionarCategoria(clave));
    contenedorFiltros.appendChild(boton);
  });

  function seleccionarCategoria(clave) {
    categoriaActiva = clave;
    contenedorFiltros.querySelectorAll('.month-item').forEach(b => {
      b.classList.toggle('active', b.dataset.incidencia === clave);
    });
    renderizarGrafica();
  }

  const esPremiumInicial = !!modalSuscripcion && modalSuscripcion.dataset.esPremium === '1';
  actualizarPermisosPlan(esPremiumInicial);

  document.addEventListener('suscripcion:cambio', (e) => {
    e.preventDefault();
    actualizarPermisosPlan(e.detail.premium);
  });

  function actualizarPermisosPlan(esPremium) {
    planPremium = esPremium;
    const tooltip = bootstrap.Tooltip.getInstance(btnVistaGrafica);

    if (esPremium) {
      btnVistaGrafica.classList.remove('disabled');
      iconoCandadoGrafica.classList.add('d-none');
      if (tooltip) tooltip.setContent({ '.tooltip-inner': 'Ver métricas gráficas' });
      badgePlanBasico.textContent = 'Premium';
      badgePlanBasico.className = 'badge bg-warning text-dark';
    } else {
      btnVistaGrafica.classList.add('disabled');
      iconoCandadoGrafica.classList.remove('d-none');
      if (tooltip) tooltip.setContent({ '.tooltip-inner': 'Disponible en Plan Premium' });
      badgePlanBasico.textContent = 'Básico';
      badgePlanBasico.className = 'badge bg-secondary';

      if (vistaActual === 'grafica') cambiarVista('lista');
    }
  }

  btnVistaLista.addEventListener('click', () => cambiarVista('lista'));
  btnVistaGrafica.addEventListener('click', () => {
    if (planPremium) cambiarVista('grafica');
  });

  function cambiarVista(destino) {
    if (destino === 'lista') {
      vistaActual = 'lista';
      btnVistaLista.classList.add('active');
      btnVistaGrafica.classList.remove('active');

      vistaGrafica.classList.add('d-none');
      vistaGrafica.classList.remove('d-flex');
      vistaLista.classList.remove('d-none');
      vistaLista.classList.add('d-flex');
    } else if (destino === 'grafica' && planPremium) {
      vistaActual = 'grafica';
      btnVistaGrafica.classList.add('active');
      btnVistaLista.classList.remove('active');

      vistaLista.classList.add('d-none');
      vistaLista.classList.remove('d-flex');
      vistaGrafica.classList.remove('d-none');
      vistaGrafica.classList.add('d-flex');
      renderizarGrafica();
    }
  }

  /* BACKEND - COMPLETAR ESTAS 2 FUNCIONES (ver instrucciones al inicio del archivo) */

  // Debe devolver la lista de reportes (todos los del año actual) con la forma indicada arriba.
  async function cargarReportes() {
    /* Ejemplo de idea:
         const respuesta = await fetch(`../PHP/reportes.php{anioActual}`);
         return await respuesta.json();
    */
    return []; // TODO backend
  }

  // Recibe el reporte nuevo, lo guarda en la base de datos y devuelve el reporte guardado. Si falla, lanzar un error.
  async function guardarReporte(reporte) {
    /* Ejemplo de idea:
         const respuesta = await fetch('../PHP/guardar-reporte.php', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json'},
           body: JSON.stringify({ categoria: reporte.categoria, descripcion: reporte.descripcion })
         });
         if (!respuesta.ok) throw new Error('No se pudo guardar el reporte');
         return await respuesta.json();
    */
    return reporte; // TODO backend: por ahora solo vive en memoria
  }

  function renderizarLista() {
    contenedorLista.textContent = '';
    listaVacia.classList.toggle('d-none', reportes.length > 0);
    reportes.forEach(r => contenedorLista.appendChild(crearTarjeta(r)));
  }

  function crearTarjeta(r) {
    const cat = CATEGORIAS[r.categoria];

    const tarjeta = crear('div', 'notif-card p-3 rounded-4 shadow d-flex align-items-center justify-content-between');
    tarjeta.dataset.reporteId = r.id;
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'button');

    const izquierda = crear('div', 'd-flex align-items-center gap-3 me-3 overflow-hidden');
    const foto = crear('img', 'notif-avatar');
    foto.src = r.foto;
    foto.alt = 'Foto perfil';

    const textos = crear('div', 'text-truncate');
    textos.appendChild(crear('span', `badge badge-cat ${cat.clase} mb-1`, cat.nombre));
    textos.appendChild(crear('p', 'mb-0 fw-medium text-white text-truncate', `${r.usuario}: ${r.descripcion}`));

    izquierda.append(foto, textos);
    tarjeta.append(izquierda, crear('i', 'bi bi-chevron-right text-white fs-5 flex-shrink-0'));

    tarjeta.addEventListener('click', () => abrirDetalle(r));
    tarjeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirDetalle(r); }
    });
    return tarjeta;
  }

  function abrirDetalle(r) {
    const cat = CATEGORIAS[r.categoria];

    // El color del símbolo, la etiqueta y la barra lateral depende de la clase de la categoría
    detalleContenido.classList.remove(...CLASES_CATEGORIA);
    detalleContenido.classList.add(cat.clase);

    const avatar = document.getElementById('detalleAvatar');
    avatar.src = r.foto;
    document.getElementById('detalleUsuario').textContent = r.usuario;

    const badge = document.getElementById('detalleBadge');
    badge.className = `badge badge-cat ${cat.clase}`;
    badge.textContent = cat.nombre;

    escribirFrase(document.getElementById('detalleFrase'), cat.frase(r.usuario));
    document.getElementById('detalleDescripcion').textContent = r.descripcion;

    const fecha = new Date(r.fecha);
    document.getElementById('detalleFecha').textContent =
      `Reportado el ${formatoFecha(fecha)} a las ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;

    bootstrap.Modal.getOrCreateInstance(modalDetalleEl).show();
  }

  function conteosPorMes(clave) {
    const conteos = new Array(12).fill(0);
    reportes.forEach(r => {
      const fecha = new Date(r.fecha);
      if (r.categoria === clave && fecha.getFullYear() === anioActual) {
        conteos[fecha.getMonth()]++;
      }
    });
    return conteos;
  }

  function renderizarGrafica() {
    tituloIncidencia.textContent = `Frecuencia Mensual: ${CATEGORIAS[categoriaActiva].nombre}`;

    const conteos = conteosPorMes(categoriaActiva);
    const hayDatos = conteos.some(c => c > 0);

    graficaContenedor.classList.toggle('d-none', !hayDatos);
    graficaVacia.classList.toggle('d-none', hayDatos);
    if (!hayDatos) return;

    const maximo = Math.max(META_REPORTES_MES, ...conteos);
    contenedorBarras.textContent = '';

    conteos.forEach((cantidad, i) => {
      const barra = crear('div', 'bar-item');
      barra.dataset.mes = MESES_CORTOS[i];
      barra.title = `${cantidad} ${cantidad === 1 ? 'reporte' : 'reportes'}`;

      const relleno = crear('div', 'bar-fill');
      relleno.style.height = `${(cantidad / maximo) * 100}%`;

      barra.append(relleno, crear('span', '', MESES_CORTOS[i]));
      contenedorBarras.appendChild(barra);
    });
  }

  function mostrarError(campo, mensaje) {
    borrarError(campo);
    const div = crear('div', 'field-error-message', mensaje);
    campo.closest('.mb-3').appendChild(div);
  }

  function borrarError(campo) {
    const previo = campo.closest('.mb-3').querySelector('.field-error-message');
    if (previo) previo.remove();
  }

  function validarCategoria() {
    if (!selectCategoria.value) return 'Debes seleccionar una categoría';
    return '';
  }

  function validarDescripcion() {
    const v = inputDescripcion.value.trim();
    if (!v) return 'No pueden dejarse los campos vacíos';
    if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]/.test(v)) return 'La descripción debe comenzar con letras';
    if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s.,;:!?¿¡()"'\-_]+$/.test(v)) return 'La descripción solo puede contener texto y signos de puntuación comunes';
    if (v.length < MIN_CARACTERES_DESCRIPCION) return `La descripción debe tener al menos ${MIN_CARACTERES_DESCRIPCION} caracteres`;
    return '';
  }

  function revisar(campo, validador) {
    const msg = validador();
    if (msg) { mostrarError(campo, msg); return false; }
    borrarError(campo);
    return true;
  }

  selectCategoria.addEventListener('change', () => {
    revisar(selectCategoria, validarCategoria);
    const cat = CATEGORIAS[selectCategoria.value];
    chipCategoria.className = `cat-chip ${cat ? cat.clase : ''}`;
    chipCategoria.firstElementChild.className = cat ? 'bi bi-exclamation-octagon-fill' : 'bi bi-exclamation-octagon';
  });
  inputDescripcion.addEventListener('input', () => revisar(inputDescripcion, validarDescripcion));

  formReporte.addEventListener('submit', async (e) => {
    e.preventDefault();
    const okCategoria = revisar(selectCategoria, validarCategoria);
    const okDescripcion = revisar(inputDescripcion, validarDescripcion);
    if (!(okCategoria && okDescripcion)) return;

    const nuevo = {
      id: Date.now(), // BACKEND: el id real lo asigna la base de datos
      usuario: usuarioActual,
      foto: fotoUsuario,
      categoria: selectCategoria.value,
      descripcion: inputDescripcion.value.trim(),
      fecha: new Date().toISOString()
    };

    try {
      const guardado = await guardarReporte(nuevo);
      reportes.unshift(guardado || nuevo); 
    } catch (error) {
      mostrarError(inputDescripcion, 'No se pudo guardar el reporte. Intenta de nuevo.');
      return;
    }
    renderizarLista();
    renderizarGrafica();
    bootstrap.Modal.getOrCreateInstance(modalNuevoEl).hide();
  });

  modalNuevoEl.addEventListener('hidden.bs.modal', () => {
    formReporte.reset();
    borrarError(selectCategoria);
    borrarError(inputDescripcion);
    chipCategoria.className = 'cat-chip';
    chipCategoria.firstElementChild.className = 'bi bi-exclamation-octagon';
  });

  seleccionarCategoria(categoriaActiva);
  cargarReportes().then(datos => {
    reportes = datos;
    renderizarLista();
    renderizarGrafica();
  });
});