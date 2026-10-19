document.addEventListener('DOMContentLoaded', () => {
  const listaChats = document.getElementById('listaChats');
  const buscarUsuario = document.getElementById('buscarUsuarioChat');
  const buscarTelefono = document.getElementById('buscarTelefonoChat');
  const mensajeBusqueda = document.getElementById('mensajeBusquedaChat');
  const encabezado = document.getElementById('encabezadoChat');
  const historial = document.getElementById('historialChat');
  const formChat = document.getElementById('formChat');
  const inputMensaje = document.getElementById('inputMensaje');
  const btnEnviar = document.getElementById('btnEnviarMensaje');

  const INTERVALO_MS = 5000; // el front consulta mensajes nuevos cada 5 segundos
  const yo = GearTask.obtenerUsuario();

  let conversaciones = [];
  let chatActual = null; // usuario con el que se conversa
  let mensajesActuales = [];

  // Todo lo que viene del servidor se inserta con textContent (nunca como HTML)
  const crearElemento = (etiqueta, clases, texto) => {
    const elemento = document.createElement(etiqueta);
    if (clases) elemento.className = clases;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  const hora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const mostrarAviso = (texto) => {
    mensajeBusqueda.textContent = texto;
    mensajeBusqueda.classList.toggle('d-none', !texto);
  };

  // ---- Lista lateral ----------------------------------------------------------

  function crearItem(usuario, vistaPrevia, fecha, sinLeer) {
    const item = crearElemento('div', 'chat-item d-flex align-items-center p-3');
    if (chatActual && chatActual._id === usuario._id) item.classList.add('active');
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => abrirChat(usuario));

    const foto = crearElemento('img', 'chat-avatar me-3');
    foto.src = GearTask.urlFoto(usuario.foto);
    foto.alt = 'Perfil';

    const info = crearElemento('div', 'chat-item-info overflow-hidden flex-grow-1');
    const fila = crearElemento('div', 'd-flex justify-content-between align-items-center mb-1');
    fila.append(
      crearElemento('span', 'fw-semibold text-white text-truncate', usuario.usuario),
      crearElemento('small', 'chat-item-time', fecha ? hora(fecha) : '')
    );
    const pie = crearElemento('div', 'd-flex justify-content-between align-items-center');
    pie.append(crearElemento('p', 'chat-item-preview mb-0 text-truncate small', vistaPrevia));
    if (sinLeer > 0) pie.append(crearElemento('span', 'badge rounded-pill bg-warning text-dark ms-2', String(sinLeer)));

    info.append(fila, pie);
    item.append(foto, info);
    return item;
  }

  function pintarLista(resultadosBusqueda) {
    listaChats.replaceChildren();

    if (resultadosBusqueda) {
      resultadosBusqueda.forEach((usuario) =>
        listaChats.append(crearItem(usuario, `${usuario.nombreCompleto} · ${usuario.rol}`, null, 0))
      );
      return;
    }
    if (conversaciones.length === 0) {
      listaChats.append(crearElemento('p', 'text-white-50 small p-3', 'Aún no tienes conversaciones.'));
      return;
    }
    conversaciones.forEach((c) =>
      listaChats.append(crearItem(c.usuario, c.ultimoMensaje, c.fecha, c.sinLeer))
    );
  }

  async function cargarConversaciones() {
    try {
      conversaciones = await GearTask.api('GET', '/chats');
      if (!buscarUsuario.value && !buscarTelefono.value) pintarLista();
    } catch (error) {
      listaChats.replaceChildren(crearElemento('p', 'text-danger small p-3', error.message));
    }
  }

  // ---- Búsqueda de personas -----------------------------------------------------

  async function buscar(parametro, valor) {
    mostrarAviso('');
    if (!valor) {
      pintarLista();
      return;
    }
    try {
      const encontrados = await GearTask.api('GET', `/usuarios/buscar?${parametro}=${encodeURIComponent(valor)}`);
      if (encontrados.length === 0) mostrarAviso('No se encontró a nadie con ese dato');
      pintarLista(encontrados);
    } catch (error) {
      mostrarAviso(error.message);
    }
  }

  let temporizador = null;
  const programarBusqueda = (parametro, campo, otroCampo) => {
    otroCampo.value = ''; // se busca por uno u otro, nunca por los dos a la vez
    clearTimeout(temporizador);
    temporizador = setTimeout(() => buscar(parametro, campo.value.trim()), 350);
  };
  buscarUsuario.addEventListener('input', () => programarBusqueda('usuario', buscarUsuario, buscarTelefono));
  buscarTelefono.addEventListener('input', () => {
    const valor = buscarTelefono.value.trim();
    if (valor.length > 0 && valor.length < 10) {
      mostrarAviso('El teléfono debe tener 10 dígitos');
      return;
    }
    programarBusqueda('telefono', buscarTelefono, buscarUsuario);
  });

  // ---- Conversación -------------------------------------------------------------

  function crearBurbuja(mensaje) {
    const esMio = mensaje.de === yo._id;
    const contenedor = crearElemento(
      'div',
      `message ${esMio ? 'sent' : 'received'} mb-3 d-flex flex-column ${esMio ? 'align-items-end' : 'align-items-start'}`
    );
    contenedor.append(
      crearElemento('div', 'message-bubble p-3 rounded-3 shadow-sm', mensaje.texto),
      crearElemento('small', 'message-time mt-1', hora(mensaje.fecha))
    );
    return contenedor;
  }

  function pintarMensajes(bajarAlFinal = true) {
    historial.replaceChildren();
    if (mensajesActuales.length === 0) {
      historial.append(crearElemento('p', 'text-white-50 text-center mt-5', 'Aún no hay mensajes. ¡Saluda!'));
      return;
    }
    mensajesActuales.forEach((mensaje) => historial.append(crearBurbuja(mensaje)));
    if (bajarAlFinal) historial.scrollTop = historial.scrollHeight;
  }

  async function abrirChat(usuario) {
    chatActual = usuario;
    mensajesActuales = [];
    encabezado.classList.remove('d-none');
    document.getElementById('nombreChat').textContent = usuario.usuario;
    document.getElementById('rolChat').textContent = usuario.rol || '';
    document.getElementById('fotoChat').src = GearTask.urlFoto(usuario.foto);
    inputMensaje.disabled = false;
    btnEnviar.disabled = false;

    try {
      const datos = await GearTask.api('GET', `/chats/${usuario._id}`);
      mensajesActuales = datos.mensajes;
      pintarMensajes();
      await cargarConversaciones();
    } catch (error) {
      historial.replaceChildren(crearElemento('p', 'text-danger text-center mt-5', error.message));
    }
  }

  // Consulta solo los mensajes posteriores al último que ya se tiene
  async function buscarNuevos() {
    if (!chatActual) return;
    const ultimo = mensajesActuales[mensajesActuales.length - 1];
    const parametro = ultimo ? `?despues=${encodeURIComponent(ultimo.fecha)}` : '';
    try {
      const datos = await GearTask.api('GET', `/chats/${chatActual._id}${parametro}`);
      if (datos.mensajes.length > 0) {
        mensajesActuales = mensajesActuales.concat(datos.mensajes);
        pintarMensajes();
        cargarConversaciones();
      }
    } catch (error) {
      console.warn('No se pudieron revisar mensajes nuevos:', error.message);
    }
  }

  formChat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = inputMensaje.value.trim();
    if (!texto || !chatActual) return;

    btnEnviar.disabled = true;
    try {
      const mensaje = await GearTask.api('POST', `/chats/${chatActual._id}`, { texto });
      mensajesActuales.push(mensaje);
      inputMensaje.value = '';
      pintarMensajes();
      cargarConversaciones();
    } catch (error) {
      window.alert(error.message);
    } finally {
      btnEnviar.disabled = false;
      inputMensaje.focus();
    }
  });

  cargarConversaciones();
  setInterval(() => {
    buscarNuevos();
    cargarConversaciones();
  }, INTERVALO_MS);
});
