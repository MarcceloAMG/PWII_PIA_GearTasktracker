/* =====================================================================
   Productividad.js

   NUEVO - INSTRUCCIONES PARA EL EQUIPO BACKEND (explicadas fácil)
   ---------------------------------------------------------------------
   La gráfica muestra UNA BARRA POR CADA DÍA del mes seleccionado.
   La altura de cada barra depende de cuántas tareas se COMPLETARON ese día.
   Regla pedida: cuando CUALQUIER participante de un equipo/proyecto completa
   una tarea, la barra de ese día debe subir.

   Lo que hay que construir:

   1) Guardar cuándo se completa una tarea.
      Cuando alguien marque una tarea como "Completada" (en el tablero de
      DetalleProyecto), guardar en la base de datos la FECHA en que se completó
      (por ejemplo, una columna fecha_completada en la tabla de tareas) y el
      proyecto/equipo al que pertenece. No importa qué participante la completó:
      cuenta para el equipo.

   2) Crear un archivo PHP que cuente las tareas por día.
      Por ejemplo ../PHP/productividad-mes.php. Recibe el año y el mes
      (ej. ?anio=2026&mes=10) y responde en formato JSON con UN número por día
      del mes (la posición 0 es el día 1, la 1 es el día 2, etc.):

         { "conteos": [0, 2, 1, 0, 3, ...] }

      Ese arreglo debe tener tantos números como días tiene el mes
      (28, 29, 30 o 31). Si el equipo no tiene ningún registro de ese mes,
      responder { "conteos": null }.

   3) Conectar esa respuesta aquí abajo.
      Solo hay que completar la función obtenerConteosDelMes() (más abajo).
      Todo lo demás (dibujar las barras, subir su altura, cambiar de mes) ya
      está hecho y usa los mismos estilos de siempre (bar-item / bar-fill).

   Cada vez que se abre la pantalla o se cambia de mes, se vuelve a pedir el
   dato, así que la gráfica siempre refleja las tareas completadas hasta ese
   momento.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // El modal de suscripción (modal-suscripcion.php) guarda el plan actual en data-es-premium
  const modalSuscripcion = document.getElementById('modalSuscripcion');
  const monthItems = document.querySelectorAll('.month-item');
  const tituloMes = document.getElementById('tituloMes');
  const badgePlan = document.getElementById('badgePlan');
  const vistaGrafica = document.getElementById('vistaGrafica');
  const vistaVacia = document.getElementById('vistaVacia');
  const contenedorBarras = document.getElementById('contenedorBarras');

  /* NUEVO: el mes actual se toma de la fecha de la computadora donde se abre la página.
     Ejemplo: si hoy es octubre, el mes actual es "Octubre". */
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = MESES[hoy.getMonth()];

  /* NUEVO: tareas completadas en un día para que su barra llegue al tope.
     Si un día supera este número, la escala se ajusta sola. Backend/diseño pueden cambiarlo. */
  const META_TAREAS_DIA = 5;

  let contadorSolicitudes = 0; // evita que una respuesta lenta pise a una más reciente

  // NUEVO: el mes actual muestra "(Actual)" y nunca lleva candado
  monthItems.forEach(item => {
    if (item.dataset.month === mesActual) {
      item.querySelector('.month-name').textContent = `${mesActual} (Actual)`;
      const lock = item.querySelector('.lock-icon');
      if (lock) lock.remove();
    }
  });

  // Estado inicial = el que calculó PHP en modal-suscripcion.php.
  // BACKEND: cuando $esPremium venga de la base de datos, al cargar la página
  // los meses ya aparecerán desbloqueados (sin tener que volver a pagar).
  const esPremiumInicial = !!modalSuscripcion && modalSuscripcion.dataset.esPremium === '1';
  actualizarEstadoPlan(esPremiumInicial);
  seleccionarMes(mesActual);

  // El modal avisa con el evento "suscripcion:cambio" cuando el usuario elige un plan.
  // preventDefault() le dice al modal que esta página ya lo atendió (no recargar).
  document.addEventListener('suscripcion:cambio', (e) => {
    e.preventDefault();
    actualizarEstadoPlan(e.detail.premium);
    if (!e.detail.premium) seleccionarMes(mesActual); // al volver a Básico se regresa al mes actual
  });

  function actualizarEstadoPlan(esPremium) {
    if (esPremium) {
      badgePlan.textContent = 'Premium';
      badgePlan.className = 'badge bg-warning text-dark';

      // Desbloquear todos los meses y quitar íconos de candado
      monthItems.forEach(item => {
        item.classList.remove('disabled');
        const lock = item.querySelector('.lock-icon');
        if (lock) lock.classList.add('d-none');
      });
    } else {
      badgePlan.textContent = 'Básico';
      badgePlan.className = 'badge bg-secondary';

      // Bloquear todos los meses salvo el mes actual
      monthItems.forEach(item => {
        if (item.dataset.month !== mesActual) {
          item.classList.add('disabled');
          const lock = item.querySelector('.lock-icon');
          if (lock) lock.classList.remove('d-none');
        }
      });
    }
  }

  // Selección de meses
  monthItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('disabled')) return;
      seleccionarMes(item.dataset.month);
    });
  });

  async function seleccionarMes(nombreMes) {
    const solicitud = ++contadorSolicitudes;

    monthItems.forEach(m => m.classList.toggle('active', m.dataset.month === nombreMes));
    tituloMes.textContent = `Métricas de Productividad - ${nombreMes}`;

    const indiceMes = MESES.indexOf(nombreMes);
    const diasDelMes = new Date(anioActual, indiceMes + 1, 0).getDate();

    let conteos = await obtenerConteosDelMes(anioActual, indiceMes);
    if (solicitud !== contadorSolicitudes) return; // llegó una selección más nueva

    // El mes actual siempre muestra su gráfica (en cero si aún no hay tareas completadas)
    if (!conteos && nombreMes === mesActual) {
      conteos = new Array(diasDelMes).fill(0);
    }

    if (conteos) {
      dibujarGrafica(conteos);
      vistaGrafica.classList.remove('d-none');
      vistaVacia.classList.add('d-none');
    } else {
      vistaGrafica.classList.add('d-none');
      vistaVacia.classList.remove('d-none');
    }
  }

  /* ---------------------------------------------------------------------
     BACKEND - COMPLETAR ESTA FUNCIÓN
     ---------------------------------------------------------------------
     Debe devolver un arreglo con las tareas completadas de CADA día del mes
     (ver instrucciones al inicio de este archivo), o null si no hay datos.

     Parámetros:
       anio      -> año (ej. 2026)
       indiceMes -> 0 = enero, 1 = febrero, ... 11 = diciembre

     Ejemplo de idea (descomentar y ajustar la ruta):

       // const respuesta = await fetch(`../PHP/productividad-mes.php?anio=${anio}&mes=${indiceMes + 1}`);
       // const datos = await respuesta.json();
       // return datos.conteos;   // ej. [0, 2, 1, 0, 3, ...] o null

     Mientras no esté conectada, devuelve null: el mes actual se ve con las
     barras en cero y los demás meses muestran "Sin datos registrados".
     --------------------------------------------------------------------- */
  async function obtenerConteosDelMes(anio, indiceMes) {
    return null; // TODO backend
  }

  /* Dibuja una barra por día. La altura es proporcional a las tareas completadas ese día
     (usa los mismos estilos de antes: bar-item / bar-fill). */
  function dibujarGrafica(conteos) {
    const maximo = Math.max(META_TAREAS_DIA, ...conteos);
    contenedorBarras.innerHTML = '';

    conteos.forEach((cantidad, i) => {
      const barra = document.createElement('div');
      barra.className = 'bar-item';

      const relleno = document.createElement('div');
      relleno.className = 'bar-fill';
      relleno.style.height = `${(cantidad / maximo) * 100}%`;

      const etiqueta = document.createElement('span');
      etiqueta.textContent = `Día ${i + 1}`;

      barra.append(relleno, etiqueta);
      contenedorBarras.appendChild(barra);
    });
  }
});