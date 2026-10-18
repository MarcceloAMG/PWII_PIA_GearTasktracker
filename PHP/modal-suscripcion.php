<?php
/* =====================================================================
   modal-suscripcion.php
   Modal de planes (Básico / Premium) de GearTask Tracker.

   CÓMO USARLO EN CUALQUIER PÁGINA (la página debe ser .php):
     <?php include '../PHP/modal-suscripcion.php'; ?>
   Se coloca dentro del <body>, ANTES de los <script> del final.
   Para abrirlo, cualquier botón solo necesita:
     data-bs-toggle="modal" data-bs-target="#modalSuscripcion"
   ===================================================================== */

// IMPORTANTE (backend): aquí NO se llama a session_start().
// session_start() debe ir en la PRIMERA línea de cada página .php (antes del <!DOCTYPE html>),
// porque si se llama después de que ya se mostró HTML, PHP lanza un error en pantalla.
// Cuando haya login real, la página que incluye este modal ya tendrá la sesión iniciada
// y aquí se podrá leer $_SESSION['id_usuario'].

/* ---------------------------------------------------------------------
   BACKEND - AQUÍ SE CONECTA LA BASE DE DATOS
   ---------------------------------------------------------------------
   Estas 2 variables controlan cómo se ve el modal. Por ahora están "a mano"
   (false) para que el frontend funcione sin base de datos.

   Backend: reemplacen estos valores consultando la BD con el usuario que
   inició sesión (por ejemplo, guardado en $_SESSION['id_usuario']):

     $esPremium         -> true si el usuario YA tiene el plan Premium activo.
     $tarjetaRegistrada -> true si el usuario YA guardó sus datos de pago antes.

   Ejemplo de idea (ajusten nombres de tabla/columnas a su BD):

     // $stmt = $pdo->prepare(
     //   "SELECT es_premium, tarjeta_registrada FROM usuarios WHERE id_usuario = ?"
     // );
     // $stmt->execute([$_SESSION['id_usuario']]);
     // $fila = $stmt->fetch();
     // $esPremium         = (bool) $fila['es_premium'];
     // $tarjetaRegistrada = (bool) $fila['tarjeta_registrada'];

   Así, al recargar la página o volver a iniciar sesión, el Premium sigue
   desbloqueado y NO se vuelve a pedir la tarjeta.
   Las páginas que desbloquean cosas (ej. Productividad) leen este mismo valor
   desde el atributo data-es-premium del modal.
   --------------------------------------------------------------------- */
$esPremium         = false; // TODO backend: leer de la base de datos
$tarjetaRegistrada = false; // TODO backend: leer de la base de datos
?>

<!-- =====================  MODAL PRINCIPAL: PLANES  ===================== -->
<div class="modal fade" id="modalSuscripcion" tabindex="-1" aria-labelledby="modalSuscripcionLabel" aria-hidden="true"
     data-es-premium="<?= $esPremium ? '1' : '0' ?>"
     data-tarjeta-registrada="<?= $tarjetaRegistrada ? '1' : '0' ?>">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
    <div class="modal-content ajustes-modal-content">

      <div class="modal-header border-0">
        <h5 class="modal-title" id="modalSuscripcionLabel"><i class="bi bi-gem me-2"></i>Elige tu plan</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>

      <div class="modal-body">
        <div class="row g-4 justify-content-center">

          <!-- ============ TARJETA: PLAN BÁSICO ============ -->
          <div class="col-12 col-md-6 col-lg-5">
            <div class="plan-card h-100 d-flex flex-column <?= !$esPremium ? 'plan-card-actual' : '' ?>" id="cardBasico">
              <h3 class="plan-title">PLAN BÁSICO</h3>
              <ul class="plan-features">
                <li>Incluye funciones básicas</li>
                <li>Incluye gráficas del mes actual</li>
                <li>Incluye visualización básica de reportes</li>
                <li>Máximo de 4 tareas activas</li> <!-- BACKEND: el límite se aplicará cuando exista el backend -->
              </ul>
              <!-- Si el usuario ya está en Básico: "Plan Actual" (deshabilitado). Si es Premium: "Elegir plan" -->
              <button type="button" class="btn btn-plan mt-auto" id="btnPlanBasico" <?= !$esPremium ? 'disabled' : '' ?>><?= !$esPremium ? 'Plan Actual' : 'Elegir plan' ?></button>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-5">
            <div class="plan-card h-100 d-flex flex-column <?= $esPremium ? 'plan-card-actual' : '' ?>" id="cardPremium">
              <h3 class="plan-title">PLAN PREMIUM</h3>
              <p class="plan-subtitle">Desde $99 MXN al mes</p>
              <ul class="plan-features">
                <li>Incluye gráficas de todo el año</li>
                <li>Incluye visualización básica + gráfica de reportes e incidencias</li>
                <li>Tareas ilimitadas</li>
              </ul>
              <!-- Si el usuario ya es Premium: "Plan Actual" (deshabilitado). Si no: "Elegir plan" abre el formulario -->
              <button type="button" class="btn btn-plan mt-auto" id="btnPlanPremium" <?= $esPremium ? 'disabled' : '' ?>><?= $esPremium ? 'Plan Actual' : 'Elegir plan' ?></button>
            </div>
          </div>
        </div>

        <div class="collapse" id="collapsePago">
          <form id="formPago" class="plan-pago-form mx-auto mt-4" novalidate>
            <h6 class="text-warning mb-3"><i class="bi bi-credit-card-2-front-fill me-2"></i>Datos de pago Premium</h6>

            <div class="mb-3">
              <label for="numTarjeta" class="form-label">Número de tarjeta</label>
              <input type="text" class="form-control auth-input" id="numTarjeta"
                     inputmode="numeric" maxlength="18" autocomplete="off" placeholder="18 dígitos">
            </div>

            <div class="row">
              <div class="col-12 col-sm-6 mb-3">
                <label for="cvvTarjeta" class="form-label">CVV</label>
                <div class="input-group auth-input-group">
                  <input type="password" class="form-control auth-input" id="cvvTarjeta"
                         inputmode="numeric" maxlength="3" autocomplete="off" placeholder="•••">
                  <button class="btn auth-toggle-pass" type="button" data-target="cvvTarjeta" aria-label="Mostrar u ocultar CVV">
                    <i class="bi bi-eye-fill"></i>
                  </button>
                </div>
              </div>

              <div class="col-12 col-sm-6 mb-3">
                <label for="tipoTarjeta" class="form-label">Tipo de tarjeta</label>
                <div class="input-group">
                  <span class="input-group-text plan-marca-chip" id="chipMarca"><i class="bi bi-credit-card"></i></span>
                  <select class="form-select auth-input" id="tipoTarjeta">
                    <option value="">Selecciona...</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-light rounded-pill" id="btnCancelarPago">Cancelar</button>
              <button type="submit" class="btn btn-outline-light btn-glow rounded-pill px-4">Suscribirme</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="modalSuscripcionExito" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content bg-success text-white border-0 rounded-4 text-center p-4">
      <i class="bi bi-check-circle-fill display-3 mb-2"></i>
      <h4 class="fw-bold">¡Suscripción exitosa!</h4>
      <p class="mb-4">Tu registro se completó y el plan Premium quedó activado.</p>
      <button type="button" class="btn btn-light rounded-pill px-4" id="btnExitoAceptar">Aceptar</button>
    </div>
  </div>
</div>

<script>
/* =====================================================================
   JS del modal de suscripción (vive aquí para que, con solo hacer el
   include, funcione en cualquier página sin agregar más archivos).
   Requiere: Bootstrap 5 (bundle) y Pantallas.js (para el botón del ojo).

   AVISO A LA PÁGINA: cuando el usuario cambia de plan, este modal lanza el
   evento "suscripcion:cambio" con { premium: true/false }.
     - Si la página lo atiende (e.preventDefault()), NO se recarga; la página
       solo actualiza lo que desbloquea (ej. Productividad.js desbloquea meses).
     - Si nadie lo atiende, la página se recarga (como en AreaTrabajo).
   ===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var modalEl = document.getElementById('modalSuscripcion');
  if (!modalEl) return;

  var exitoEl        = document.getElementById('modalSuscripcionExito');
  var cardBasico     = document.getElementById('cardBasico');
  var cardPremium    = document.getElementById('cardPremium');
  var btnPremium     = document.getElementById('btnPlanPremium');
  var btnBasico      = document.getElementById('btnPlanBasico');
  var collapseEl     = document.getElementById('collapsePago');
  var form           = document.getElementById('formPago');
  var inputTarjeta   = document.getElementById('numTarjeta');
  var inputCvv       = document.getElementById('cvvTarjeta');
  var selectTipo     = document.getElementById('tipoTarjeta');
  var chipMarca      = document.getElementById('chipMarca');
  var tarjetaYaGuardada = modalEl.dataset.tarjetaRegistrada === '1';

  function pintarPlanes(esPremium) {
    modalEl.dataset.esPremium = esPremium ? '1' : '0';
    cardBasico.classList.toggle('plan-card-actual', !esPremium);
    cardPremium.classList.toggle('plan-card-actual', esPremium);
    btnBasico.disabled = !esPremium;
    btnBasico.textContent = esPremium ? 'Elegir plan' : 'Plan Actual';
    btnPremium.disabled = esPremium;
    btnPremium.textContent = esPremium ? 'Plan Actual' : 'Elegir plan';
  }

  /* -------- Avisa a la página del cambio de plan -------. */
  function avisarCambioPlan(esPremium) {
    var evento = new CustomEvent('suscripcion:cambio', {
      detail: { premium: esPremium },
      cancelable: true
    });
    var nadieLoAtendio = document.dispatchEvent(evento);
    if (nadieLoAtendio) {
      window.location.reload(); 
      return false;
    }
    pintarPlanes(esPremium);
    return true;
  }

  function mostrarError(campo, mensaje) {
    borrarError(campo);
    var div = document.createElement('div');
    div.className = 'field-error-message';
    div.innerText = mensaje;
    campo.closest('.mb-3').appendChild(div);
  }
  function borrarError(campo) {
    var previo = campo.closest('.mb-3').querySelector('.field-error-message');
    if (previo) previo.remove();
  }

  function validarTarjeta() {
    var v = inputTarjeta.value.trim();
    if (!v) return 'No pueden dejarse los campos vacíos';
    if (!/^\d{18}$/.test(v)) return 'El número de tarjeta debe tener 18 dígitos';
    return '';
  }
  function validarCvv() {
    var v = inputCvv.value.trim();
    if (!v) return 'No pueden dejarse los campos vacíos';
    if (!/^\d{3}$/.test(v)) return 'El CVV debe tener 3 dígitos';
    return '';
  }
  function validarTipo() {
    if (!selectTipo.value) return 'Selecciona el tipo de tarjeta (Visa o Mastercard)';
    return '';
  }

  function revisar(campo, validador) {
    var msg = validador();
    if (msg) { mostrarError(campo, msg); return false; }
    borrarError(campo);
    return true;
  }

  [inputTarjeta, inputCvv].forEach(function (inp) {
    inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, ''); });
  });
  inputTarjeta.addEventListener('input', function () { revisar(inputTarjeta, validarTarjeta); });
  inputCvv.addEventListener('input',     function () { revisar(inputCvv, validarCvv); });

  selectTipo.addEventListener('change', function () {
    revisar(selectTipo, validarTipo);
    if (selectTipo.value === 'visa') {
      chipMarca.className = 'input-group-text plan-marca-chip marca-visa';
      chipMarca.innerHTML = 'VISA';
    } else if (selectTipo.value === 'mastercard') {
      chipMarca.className = 'input-group-text plan-marca-chip';
      chipMarca.innerHTML = '<span class="mc-dot mc-red"></span><span class="mc-dot mc-orange"></span>';
    } else {
      chipMarca.className = 'input-group-text plan-marca-chip';
      chipMarca.innerHTML = '<i class="bi bi-credit-card"></i>';
    }
  });

  /* Envío del formulario: se validan TODOS los campos */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okTarjeta = revisar(inputTarjeta, validarTarjeta);
    var okCvv     = revisar(inputCvv, validarCvv);
    var okTipo    = revisar(selectTipo, validarTipo);
    if (!(okTarjeta && okCvv && okTipo)) return;
    activarPremium();
  });

  document.getElementById('btnCancelarPago').addEventListener('click', function () {
    bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
  });

  /* ---------- Botón "Elegir plan" del Premium ---------- */
  btnPremium.addEventListener('click', function () {
    if (tarjetaYaGuardada) {
      // El usuario ya registró su tarjeta antes: NO se le pide de nuevo.
      activarPremium();
    } else {
      bootstrap.Collapse.getOrCreateInstance(collapseEl).show();
      setTimeout(function () { collapseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 200);
    }
  });

  /* ---------- Botón "Elegir plan" del Básico (solo está activo si ya es Premium) ---------- */
  btnBasico.addEventListener('click', function () {
    /* BACKEND: aquí se cancelaría/bajaría la suscripción en la base de datos
       (es_premium = 0) ANTES de avisar a la página. */
    if (avisarCambioPlan(false)) {
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
  });

  /* ---------- Activar Premium + alerta de éxito ---------- */
  function activarPremium() {
    /* BACKEND - AQUÍ SE GUARDA EL PLAN EN LA BASE DE DATOS
       -------------------------------------------------------
       Antes de mostrar la alerta de éxito, backend debe:
         1) Enviar los datos a un archivo PHP (por ejemplo ../PHP/guardar-suscripcion.php).
         2) En ese PHP: guardar que el usuario ya es Premium (es_premium = 1)
            y que ya registró su tarjeta (tarjeta_registrada = 1).
         3) Responder "ok" o un error.
         4) Solo si respondió "ok", mostrar la alerta de éxito de abajo.

       Ejemplo de idea:
         // fetch('../PHP/guardar-suscripcion.php', {
         //   method: 'POST',
         //   headers: { 'Content-Type': 'application/json' },
         //   body: JSON.stringify({ tipoTarjeta: selectTipo.value })
         // }).then(function (r) { return r.json(); }).then(mostrarExito);

       IMPORTANTE: el CVV NO se debe guardar nunca en la base de datos.
       Gracias a esto, en la próxima carga el PHP de arriba (BACKEND 1) leerá
       es_premium = 1 y el modal ya aparecerá con el Premium desbloqueado. */
    tarjetaYaGuardada = true; // mientras no haya backend: ya no se vuelve a pedir la tarjeta en esta visita
    mostrarExito();
  }

  function mostrarExito() {
    modalEl.addEventListener('hidden.bs.modal', function () {
      bootstrap.Modal.getOrCreateInstance(exitoEl).show();
    }, { once: true });
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  document.getElementById('btnExitoAceptar').addEventListener('click', function () {
    if (avisarCambioPlan(true)) {
      bootstrap.Modal.getOrCreateInstance(exitoEl).hide();
    }
  });

  modalEl.addEventListener('hidden.bs.modal', function () {
    form.reset();
    [inputTarjeta, inputCvv, selectTipo].forEach(borrarError);
    inputCvv.type = 'password';
    var ojo = form.querySelector('.auth-toggle-pass i');
    if (ojo) { ojo.className = 'bi bi-eye-fill'; }
    chipMarca.className = 'input-group-text plan-marca-chip';
    chipMarca.innerHTML = '<i class="bi bi-credit-card"></i>';
    bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false }).hide();
  });
});
</script>