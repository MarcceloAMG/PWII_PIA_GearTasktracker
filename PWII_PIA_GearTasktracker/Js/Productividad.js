document.addEventListener('DOMContentLoaded', () => {
  const tituloMes = document.getElementById('tituloMes');
  const badgePlan = document.getElementById('badgePlan');
  const listaMeses = document.getElementById('listaMeses');
  const vistaGrafica = document.getElementById('vistaGrafica');
  const vistaVacia = document.getElementById('vistaVacia');
  const contenedorDias = document.getElementById('contenedorDias');
  const resumenMes = document.getElementById('resumenMes');

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;

  let esPremium = false;
  let mesSeleccionado = mesActual;

  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  // Lista de meses: en básico solo el mes actual está disponible (los demás con candado)
  function pintarMeses() {
    listaMeses.replaceChildren();
    MESES.forEach((nombre, indice) => {
      const numero = indice + 1;
      const esActual = numero === mesActual;
      const bloqueado = !esPremium && !esActual;

      const boton = crearElemento('button', 'month-item');
      boton.type = 'button';
      boton.dataset.month = nombre;
      boton.append(esActual ? `${nombre} (Actual)` : `${nombre} `);
      if (bloqueado) {
        boton.classList.add('disabled');
        boton.append(crearElemento('i', 'bi bi-lock-fill lock-icon'));
      }
      if (numero === mesSeleccionado) boton.classList.add('active');

      boton.addEventListener('click', () => {
        if (boton.classList.contains('disabled')) return;
        mesSeleccionado = numero;
        pintarMeses();
        cargarMes();
      });
      listaMeses.append(boton);
    });
  }

  function pintarBarras(datos) {
    contenedorDias.replaceChildren();
    const maximo = Math.max(1, ...datos.porDia);

    datos.porDia.forEach((cantidad, indice) => {
      const barra = crearElemento('div', 'bar-item');
      barra.title = `Día ${indice + 1}: ${cantidad} tarea(s) completada(s)`;
      const relleno = crearElemento('div', 'bar-fill');
      relleno.style.height = `${(cantidad / maximo) * 100}%`;
      barra.append(relleno, crearElemento('span', '', `Día ${indice + 1}`));
      contenedorDias.append(barra);
    });
  }

  async function cargarMes() {
    tituloMes.textContent = `Métricas de Productividad - ${MESES[mesSeleccionado - 1]}`;
    try {
      const datos = await GearTask.api('GET', `/productividad?anio=${anio}&mes=${mesSeleccionado}`);
      if (datos.completadas === 0) {
        vistaGrafica.classList.add('d-none');
        vistaVacia.classList.remove('d-none');
        return;
      }
      vistaVacia.classList.add('d-none');
      vistaGrafica.classList.remove('d-none');
      resumenMes.textContent =
        `${datos.completadas} tarea(s) completada(s) · ${datos.aTiempo} a tiempo`;
      pintarBarras(datos);
    } catch (error) {
      window.alert(error.message);
    }
  }

  GearTask.enlazarSwitchPlan((plan) => {
    esPremium = plan === 'premium';
    badgePlan.textContent = esPremium ? 'Premium' : 'Básico';
    badgePlan.className = esPremium ? 'badge bg-warning text-dark' : 'badge bg-secondary';

    // Al volver a básico se regresa al mes actual, el único disponible
    if (!esPremium) mesSeleccionado = mesActual;
    pintarMeses();
    cargarMes();
  });
});
