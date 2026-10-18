<?php
// NUEVO: la sesión se inicia aquí, en la PRIMERA línea de la página (antes de cualquier HTML).
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productividad | GearTask Tracker</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <link rel="stylesheet" href="../Css/EstiloBase.css">
    <link rel="stylesheet" href="../Css/EstiloAreaTrabajo.css">
    <!-- NUEVO: el modal de suscripción usa los estilos de formulario (inputs, ojo, errores) -->
    <link rel="stylesheet" href="../Css/EstiloFormulario.css">
    <link rel="stylesheet" href="../Css/EstiloProductividad.css">
</head>

<body>

  <div class="app-shell">

    <div class="content-column flex-grow-1">

      <header class="topbar">
        <div class="topbar-icons">
          <button type="button" class="topbar-icon-btn" data-bs-toggle="modal" data-bs-target="#modalSuscripcion"
                  data-bs-placement="bottom" title="Cambiar entre versión básica y premium">
            <i class="bi bi-gem"></i>
          </button>
        </div>
      </header>

      <main class="main-content d-flex flex-column p-4 position-relative">
        
        <div class="d-flex align-items-center justify-content-between mb-3 z-2">
          <div>
            <h3 class="fw-bold text-dark mb-0" id="tituloMes">Métricas de Productividad</h3>
            <small class="text-muted" id="subtituloPlan">Plan Actual: <span class="badge bg-secondary" id="badgePlan">Básico</span></small>
          </div>
        </div>

        <div class="chart-wrapper rounded-4 p-4 shadow-sm z-2 flex-grow-1 d-flex flex-column justify-content-center">
          
          <!-- Vista Gráfica Activa (mes seleccionado) -->
          <div id="vistaGrafica" class="chart-scroll-container">
            <!-- NUEVO: se eliminaron las barras de ejemplo. Productividad.js dibuja aquí una barra por cada
                 día del mes seleccionado (usa los mismos estilos: bar-item / bar-fill).
                 BACKEND: ver las instrucciones al inicio de Productividad.js -->
            <div class="chart-bars-mock d-flex align-items-end gap-3 pb-3" id="contenedorBarras"></div>
          </div>

          <!-- Vista Vacía (Para otros meses en modo Premium) -->
          <div id="vistaVacia" class="chart-empty-state d-none text-center p-5">
            <i class="bi bi-bar-chart-line fs-1 text-white-50 mb-3"></i>
            <h5 class="text-white">Sin datos registrados para este mes</h5>
            <p class="text-white-50 mb-0 small">Aún no hay tareas completadas registradas para este mes.</p>
          </div>
        </div>

      </main>

    </div>

    <!-- SIDEBAR DERECHA: SELECCIÓN DE MESES -->
    <aside class="sidebar sidebar-months border-start border-secondary">
      
      <div class="p-3 border-bottom border-secondary">
        <h5 class="mb-0 fw-bold text-white"><i class="bi bi-calendar3 me-2"></i>Productividad</h5>
      </div>

      <div class="months-list overflow-auto flex-grow-1 p-2">
        <!-- NUEVO: el mes actual y su "(Actual)" los pone Productividad.js según la fecha de la computadora -->
        <button class="month-item" data-month="Enero"><span class="month-name">Enero</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Febrero"><span class="month-name">Febrero</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Marzo"><span class="month-name">Marzo</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Abril"><span class="month-name">Abril</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Mayo"><span class="month-name">Mayo</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Junio"><span class="month-name">Junio</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Julio"><span class="month-name">Julio</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Agosto"><span class="month-name">Agosto</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Septiembre"><span class="month-name">Septiembre</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Octubre"><span class="month-name">Octubre</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Noviembre"><span class="month-name">Noviembre</span> <i class="bi bi-lock-fill lock-icon"></i></button>
        <button class="month-item" data-month="Diciembre"><span class="month-name">Diciembre</span> <i class="bi bi-lock-fill lock-icon"></i></button>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-footer-row">
          <a href="AreaTrabajo.php" class="btn btn-outline-light btn-glow btn-glow-danger rounded-pill sidebar-footer-btn d-flex align-items-center justify-content-center gap-2 w-100">
            <i class="bi bi-arrow-left"></i>
            <span class="footer-btn-text">Volver</span>
          </a>
        </div>
      </div>

    </aside>

  </div>

  <?php include '../PHP/modal-suscripcion.php'; ?>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../Js/Pantallas.js"></script>
  <script src="../Js/Productividad.js"></script>
</body>
</html>