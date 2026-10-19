// Cliente de la API de GearTask Tracker.
// Agrega el token a cada petición, convierte los errores del servidor en mensajes
// legibles y guarda la sesión. Se carga antes del JS de cada pantalla:
//   <script src="../Js/api.js"></script>
(function () {
  // Si la pantalla se abre desde el mismo servidor (http://localhost:3000/Html/...) se usa
  // la ruta relativa. Si se abre desde otro lado (Live Server, archivo local) se apunta al
  // backend; cambia el puerto aquí si modificaste PORT en el .env.
  const URL_BACKEND = 'http://localhost:3000';
  const API_BASE = window.location.port === '3000' ? '/api' : `${URL_BACKEND}/api`;

  const CLAVE_TOKEN = 'geartask_token';
  const CLAVE_USUARIO = 'geartask_usuario';

  const leer = (clave) => {
    try {
      return localStorage.getItem(clave);
    } catch {
      return null;
    }
  };

  const obtenerToken = () => leer(CLAVE_TOKEN);

  const obtenerUsuario = () => {
    try {
      return JSON.parse(leer(CLAVE_USUARIO));
    } catch {
      return null;
    }
  };

  const guardarSesion = (token, usuario) => {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      // Sin almacenamiento disponible: la sesión solo dura mientras no se recargue
    }
  };

  const limpiarSesion = () => {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      // nada que limpiar
    }
  };

  const cerrarSesion = () => {
    limpiarSesion();
    window.location.href = 'login.html';
  };

  // Para las pantallas privadas (se usa desde la Sesión 3)
  const requerirSesion = () => {
    if (!obtenerToken()) window.location.href = 'login.html';
  };

  // api('POST', '/auth/login', { correo, password })  → devuelve el campo "data"
  // El cuerpo puede ser un objeto (JSON) o un FormData (formularios con archivos).
  async function api(metodo, ruta, cuerpo) {
    const opciones = { method: metodo, headers: {} };
    const token = obtenerToken();

    if (token) opciones.headers.Authorization = `Bearer ${token}`;

    if (cuerpo instanceof FormData) {
      opciones.body = cuerpo; // el navegador pone el Content-Type con su boundary
    } else if (cuerpo !== undefined) {
      opciones.headers['Content-Type'] = 'application/json';
      opciones.body = JSON.stringify(cuerpo);
    }

    let respuesta;
    try {
      respuesta = await fetch(`${API_BASE}${ruta}`, opciones);
    } catch {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }

    let json = null;
    try {
      json = await respuesta.json();
    } catch {
      // la respuesta no trae JSON
    }

    if (!respuesta.ok || (json && json.ok === false)) {
      // Sesión vencida en una pantalla privada: se limpia y se manda al login.
      // En /auth/* un 401 solo significa credenciales incorrectas, no sesión vencida.
      if (respuesta.status === 401 && token && !ruta.startsWith('/auth/')) {
        cerrarSesion();
      }
      throw new Error((json && json.mensaje) || `Error ${respuesta.status}`);
    }

    return json ? json.data : null;
  }

  window.GearTask = {
    api,
    guardarSesion,
    obtenerToken,
    obtenerUsuario,
    cerrarSesion,
    requerirSesion,
  };
})();
