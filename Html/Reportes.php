<?php
session_start();

/* BACKEND: 
   Por ahora son valores de relleno. Backend: reemplacen estos 2 valores con los datos
   reales del usuario que inició sesión. El JS los lee desde los data-* del <body>. */
$usuarioActual = $_SESSION['usuario'] ?? 'Ejemplo_01';         
$fotoUsuario   = $_SESSION['foto']    ?? '../Assets/perfil.jpg'; 
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reportes | GearTask Tracker</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <link rel="stylesheet" href="../Css/EstiloBase.css">
    <link rel="stylesheet" href="../Css/EstiloAreaTrabajo.css">
    <link rel="stylesheet" href="../Css/EstiloNotificaciones.css">
    <link rel="stylesheet" href="../Css/EstiloFormulario.css">
    <link rel="stylesheet" href="../Css/EstiloProductividad.css">
    <link rel="stylesheet" href="../Css/EstiloReportes.css">
</head>

<body data-usuario="<?= htmlspecialchars($usuarioActual, ENT_QUOTES, 'UTF-8') ?>"
      data-foto="<?= htmlspecialchars($fotoUsuario, ENT_QUOTES, 'UTF-8') ?>">

  <div class="app-shell position-relative flex-column">
    <header class="topbar w-100 d-flex align-items-center justify-content-between px-4 py-3 z-3 border-bottom border-secondary border-opacity-25">
      <nav class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-outline-light rounded-pill px-3 py-1 btn-nav-view active" id="btnVistaLista">
          <i class="bi bi-list-task me-1"></i> Lista
        </button>
        <button type="button" class="btn btn-outline-light rounded-pill px-3 py-1 btn-nav-view disabled" id="btnVistaGrafica" title="Disponible en Plan Premium">
          <i class="bi bi-bar-chart-fill me-1"></i> Gráficas
          <i class="bi bi-lock-fill ms-1 lock-icon text-warning" id="iconoCandadoGrafica"></i>
        </button>
      </nav>

      <div class="topbar-icons m-0">
        <button type="button" class="topbar-icon-btn shadow" data-bs-toggle="modal" data-bs-target="#modalSuscripcion"
                data-bs-placement="bottom" title="Cambiar plan de la cuenta">
          <i class="bi bi-gem"></i>
        </button>
      </div>
    </header>

    <div class="flex-grow-1 w-100 position-relative d-flex">

      <div id="vistaLista" class="w-100 min-vh-100 notif-screen d-flex flex-column position-relative overflow-hidden">
        <main class="container py-4 flex-grow-1 position-relative z-2" style="max-width: 800px;">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-2 border-bottom border-secondary">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-text-fill fs-2 text-dark me-3"></i>
              <div>
                <h2 class="fw-bold m-0 text-dark">Reportes de Incumplimiento</h2>
                <small class="text-muted">Plan Actual: <span class="badge bg-secondary" id="badgePlanBasico">Básico</span></small>
              </div>
            </div>

            <button type="button" class="btn btn-plan px-4 d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#modalNuevoReporte">
              <i class="bi bi-flag-fill"></i>
              <span>Levantar reporte</span>
            </button>
          </div>

          <!-- Reportes.js dibuja aquí las tarjetas. -->
          <div class="d-flex flex-column gap-3" id="contenedorReportesLista"></div>

          <div id="listaVacia" class="text-center text-muted py-5 d-none">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            <h5 class="mb-1">No hay reportes que mostrar</h5>
            <p class="small mb-0">Usa el botón "Levantar reporte" para crear el primero.</p>
          </div>
        </main>

        <div class="notif-back-btn position-fixed bottom-0 start-0 m-4 z-3">
          <a href="AreaTrabajo.php" class="btn btn-outline-light btn-glow btn-glow-danger rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow">
            <i class="bi bi-arrow-left fs-5"></i>
            <span class="fw-semibold">Volver</span>
          </a>
        </div>
      </div>

      <div id="vistaGrafica" class="w-100 min-vh-100 d-none flex-row">

        <div class="content-column flex-grow-1">
          <main class="main-content d-flex flex-column p-4 position-relative">
            <div class="d-flex align-items-center justify-content-between mb-3 z-2">
              <div>
                <div class="d-flex align-items-center flex-wrap gap-3">
                  <h3 class="fw-bold text-dark mb-0">Métricas Históricas de Incidencias</h3>
                  <span class="badge reloj-badge">
                    <i class="bi bi-calendar-event me-1"></i><span id="fechaHoy"></span>
                    <i class="bi bi-clock ms-3 me-1"></i><span id="horaActual"></span>
                  </span>
                </div>
                <small class="text-muted">Plan Actual: <span class="badge bg-warning text-dark">Premium</span></small>
              </div>
            </div>

            <div class="chart-wrapper rounded-4 p-4 shadow-sm z-2 flex-grow-1 d-flex flex-column justify-content-between">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="text-white mb-0" id="tituloIncidencia">Frecuencia Mensual</h5>
                <span class="badge bg-outline-light text-white-50 border border-secondary">Acumulado Anual <span id="anioGrafica"></span></span>
              </div>

              <div class="chart-scroll-container" id="graficaContenedor">
                <div class="chart-bars-mock d-flex align-items-end gap-3 pb-3" id="contenedorBarras"></div>
              </div>

              <div id="graficaVacia" class="chart-empty-state d-none text-center p-5">
                <i class="bi bi-bar-chart-line fs-1 text-white-50 mb-3"></i>
                <h5 class="text-white">No hay datos que mostrar</h5>
                <p class="text-white-50 mb-0 small">Aún no hay reportes de esta categoría este año.</p>
              </div>
            </div>
          </main>
        </div>

        <aside class="sidebar sidebar-months border-start border-secondary">
          <div class="p-3 border-bottom border-secondary">
            <h5 class="mb-0 fw-bold text-white"><i class="bi bi-funnel-fill me-2"></i>Motivo Reportado</h5>
          </div>

          <div class="months-list overflow-auto flex-grow-1 p-2" id="contenedorFiltrosIncidencia"></div>

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
    </div>

  </div>

  <!-- MODAL PARA LEVANTAR UN REPORTE -->
  <div class="modal fade" id="modalNuevoReporte" tabindex="-1" aria-labelledby="modalNuevoReporteLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content ajustes-modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title" id="modalNuevoReporteLabel"><i class="bi bi-flag-fill me-2"></i>Levantar reporte</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <form id="formNuevoReporte" novalidate>
          <div class="modal-body">
            <div class="mb-3">
              <label for="categoriaReporte" class="form-label">Categoría del reporte</label>
              <div class="input-group">
                <span class="input-group-text plan-marca-chip">
                  <span class="cat-chip" id="chipCategoria"><i class="bi bi-exclamation-octagon"></i></span>
                </span>
                <select class="form-select auth-input" id="categoriaReporte">
                  <option value="">Selecciona una categoría...</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label for="descripcionReporte" class="form-label">Descripción</label>
              <textarea class="form-control auth-input" id="descripcionReporte" rows="4" maxlength="500"
                        placeholder="Describe lo ocurrido..."></textarea>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-light rounded-pill" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-outline-light btn-glow rounded-pill px-4">Enviar reporte</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalDetalleReporte" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content notif-modal-content border-0 shadow-lg" id="detalleContenido">
        <div class="modal-header border-bottom border-dark border-opacity-25">
          <h5 class="modal-title fw-bold text-dark">
            <i class="bi bi-exclamation-octagon-fill me-2 cat-icon"></i>Detalle de Incumplimiento
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body text-dark">
          <div class="d-flex align-items-center gap-3 mb-3">
            <img src="../Assets/perfil.jpg" alt="Foto perfil" class="notif-avatar-modal" id="detalleAvatar">
            <div>
              <h6 class="mb-0 fw-bold" id="detalleUsuario"></h6>
              <span class="badge badge-cat" id="detalleBadge"></span>
            </div>
          </div>
          <p class="mb-2" id="detalleFrase"></p>
          <p class="mb-2 reporte-descripcion" id="detalleDescripcion"></p>
          <small class="text-muted" id="detalleFecha"></small>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-dark rounded-pill px-4" data-bs-dismiss="modal">Entendido</button>
        </div>
      </div>
    </div>
  </div>

  <?php include '../PHP/modal-suscripcion.php'; ?>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../Js/Pantallas.js"></script>
  <script src="../Js/Reportes.js"></script>
</body>
</html>