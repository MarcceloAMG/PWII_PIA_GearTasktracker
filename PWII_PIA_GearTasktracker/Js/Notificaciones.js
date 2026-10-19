document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('listaNotificaciones');
  const btnMarcarTodas = document.getElementById('btnMarcarTodas');
  const modalElemento = document.getElementById('modalNotif');

  const TIPOS = {
    nuevo_miembro: 'Nuevo Miembro',
    cambio_usuario: 'Cambio de Usuario',
    tarea_asignada: 'Tarea Asignada',
    limbo: 'Tarea en Limbo',
    reporte: 'Reporte de Incumplimiento',
  };

  let notificaciones = [];

  // Todo lo que viene del servidor se inserta con textContent (nunca como HTML)
  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  const fotoDe = (notificacion) => GearTask.urlFoto(notificacion.origen && notificacion.origen.foto);

  function crearTarjeta(notificacion) {
    const tarjeta = crearElemento(
      'div',
      'notif-card p-3 rounded-4 shadow d-flex align-items-center justify-content-between'
    );
    tarjeta.style.cursor = 'pointer';
    tarjeta.addEventListener('click', () => abrirDetalle(notificacion));

    const izquierda = crearElemento('div', 'd-flex align-items-center gap-3 me-3 overflow-hidden');
    const imagen = crearElemento('img', 'notif-avatar');
    imagen.src = fotoDe(notificacion);
    imagen.alt = 'Icono Notificación';

    const texto = crearElemento('div', 'text-truncate');
    texto.append(
      notificacion.leida
        ? crearElemento('span', 'badge bg-secondary mb-1', 'Leída')
        : crearElemento('span', 'badge bg-warning text-dark mb-1', 'Nueva'),
      crearElemento('p', 'mb-0 fw-medium text-white text-truncate', notificacion.mensaje)
    );

    izquierda.append(imagen, texto);
    tarjeta.append(izquierda, crearElemento('i', 'bi bi-chevron-right text-white fs-5 flex-shrink-0'));
    return tarjeta;
  }

  function pintar() {
    lista.replaceChildren();
    if (notificaciones.length === 0) {
      lista.append(crearElemento('p', 'text-dark', 'No tienes notificaciones por ahora.'));
      return;
    }
    notificaciones.forEach((notificacion) => lista.append(crearTarjeta(notificacion)));
  }

  async function abrirDetalle(notificacion) {
    document.getElementById('tituloModalNotif').textContent = TIPOS[notificacion.tipo] || 'Notificación';
    document.getElementById('nombreModalNotif').textContent = notificacion.origen
      ? notificacion.origen.usuario
      : 'Sistema';
    document.getElementById('detalleModalNotif').textContent = notificacion.workspace
      ? `Proyecto: ${notificacion.workspace.titulo}`
      : '';
    document.getElementById('textoModalNotif').textContent = notificacion.mensaje;
    document.getElementById('avatarModalNotif').src = fotoDe(notificacion);
    bootstrap.Modal.getOrCreateInstance(modalElemento).show();

    // Al abrirla pasa a "leída"; el contenido nunca se modifica
    if (!notificacion.leida) {
      try {
        const actualizada = await GearTask.api('PATCH', `/notificaciones/${notificacion._id}/leida`);
        notificacion.leida = actualizada.leida;
        pintar();
      } catch (error) {
        console.warn('No se pudo marcar como leída:', error.message);
      }
    }
  }

  btnMarcarTodas.addEventListener('click', async () => {
    try {
      await GearTask.api('PATCH', '/notificaciones/leidas');
      notificaciones.forEach((notificacion) => {
        notificacion.leida = true;
      });
      pintar();
    } catch (error) {
      window.alert(error.message);
    }
  });

  GearTask.api('GET', '/notificaciones')
    .then((datos) => {
      notificaciones = datos;
      pintar();
    })
    .catch((error) => {
      lista.replaceChildren(crearElemento('p', 'text-danger', error.message));
    });
});
