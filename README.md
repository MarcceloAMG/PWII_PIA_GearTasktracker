# GearTask Tracker

Plataforma de gestión de equipos de trabajo con asignación **manual o automática** de tareas y herramientas administrativas para medir el rendimiento de cada integrante.

Proyecto de **Programación Web II**  — 2.º avance: Back End + Front End.

## Integrantes

| Nombre | Matrícula |
|---|---|
| Hernández Salazar Brandon Oziel | 1952180 |
| González Maldonado Adrián Marcelo | 1973137 |
| Nicolás Saucedo Eduardo | 2015299 |

Equipo: 

## Descripción

Existen dos versiones, ambas funcionales:

| Función | Básica | Premium |
|---|---|---|
| Tareas activas simultáneas por integrante | Máximo 3 | Límite general e individual configurable |
| Productividad | Solo el mes actual | Histórico de cualquier mes |
| Reportes de incumplimiento | Lista | Lista + gráficas de incidencias |

Incluye registro/login con JWT, proyectos (workspaces) con tableros, asignación manual, voluntaria y automática por rol y carga, notificaciones, reportes de incumplimiento, productividad y chats 1 a 1.

## Tecnologías

Node.js, Express 4, MongoDB + Mongoose 8, JWT, bcryptjs, multer, express-validator, HTML + JavaScript + Bootstrap 5, Postman.

## Estructura del repositorio

```
backend/
  server.js              punto de entrada
  src/
    app.js               configuración de Express
    config/              variables de entorno, constantes, conexión a MongoDB
    routes/              rutas por recurso
    validators/          validación de entradas
    controllers/         capa HTTP
    services/            lógica de negocio
    models/              esquemas Mongoose
    middlewares/         auth, premium, workspace, upload, errores
    utils/               ApiError, asyncHandler, plan
  scripts/seed.js        datos de demostración
  postman/               colección y entorno de Postman
PWII_PIA_GearTasktracker/  front end (Html, Css, Js, Assets)
GEARTASK TRACKER.pdf     especificación original
```

La arquitectura por capas es: rutas → validadores → controladores → servicios → modelos. El diseño técnico completo (pantallas, rutas y modelo de datos) está en el PDF de entrega.

## Cómo ejecutarlo

Requisitos: Node.js 22 o superior y una instancia de MongoDB (local o Atlas).

```bash
cd backend
npm install
cp .env.example .env     # en Windows: copy .env.example .env
```

Edita `.env` con tu `MONGO_URI` y un `JWT_SECRET` propio. Luego:

```bash
npm run seed    # opcional: carga datos de demostración
npm run dev     # desarrollo (o: npm start)
```

Abre <http://localhost:3000/>. El mismo servidor sirve el front y la API (`/api`).

### Cuentas de demostración (tras `npm run seed`)

Contraseña de todas: `123456`

- `admin_demo@geartask.demo` — administrador, Premium
- `ejemplo_01@geartask.demo` — Programador Frontend
- `luis@geartask.demo` — Documentador
- `ejemplo_02@geartask.demo` — Diseñador

## Pantallas (rutas del front)

| Pantalla | Ruta | Acceso |
|---|---|---|
| Principal | `/Html/PaginaPrincipal.html` (también `/`) | Pública |
| Inicio de sesión | `/Html/login.html` | Pública |
| Registro | `/Html/registro.html` | Pública |
| Área de trabajo | `/Html/AreaTrabajo.html` | Privada |
| Detalle del proyecto | `/Html/DetalleProyecto.html?id=<workspaceId>` | Privada |
| Notificaciones | `/Html/Notificaciones.html` | Privada |
| Reportes | `/Html/Reportes.html` | Privada |
| Productividad | `/Html/Productividad.html` | Privada |
| Chats | `/Html/chats.html` | Privada |

## API

Prefijo `/api`. Las rutas privadas requieren `Authorization: Bearer <token>`. Respuestas: `{ "ok": true, "data": ... }` o `{ "ok": false, "mensaje": "..." }`.

| Módulo | Rutas |
|---|---|
| Auth | `POST /auth/registro`, `POST /auth/login` |
| Usuarios | `GET /usuarios/me`, `PATCH /usuarios/me/usuario`, `PATCH /usuarios/me/password`, `GET /usuarios/buscar`, `PATCH /usuarios/me/plan` |
| Proyectos | `GET/POST /workspaces`, `GET/PUT/DELETE /workspaces/:id`, `PATCH /workspaces/:id/limite`, `POST /workspaces/:id/miembros`, `PATCH/DELETE /workspaces/:id/miembros/:uid` |
| Tableros | `GET/POST /workspaces/:id/tableros`, `PUT/DELETE /tableros/:id` |
| Tareas | `GET/POST /workspaces/:id/tareas`, `POST /workspaces/:id/tareas/auto-asignar`, `GET /tareas/mias`, `PATCH /tareas/:id/{asignar,tomar,aprobar-excepcion,iniciar,completar}`, `POST /tareas/:id/reportar`, `DELETE /tareas/:id` |
| Notificaciones | `GET /notificaciones`, `PATCH /notificaciones/leidas`, `PATCH /notificaciones/:id/leida` |
| Reportes | `GET /reportes`, `GET /reportes/estadisticas` (Premium) |
| Productividad | `GET /productividad` |
| Chats | `GET /chats`, `GET /chats/sin-leer`, `GET/POST /chats/:usuarioId` |
| Salud | `GET /salud` |

La tabla completa con roles y descripción está en el PDF de diseño técnico.

## Pruebas con Postman

Importa `backend/postman/GearTask.postman_collection.json` y `backend/postman/GearTask-local.postman_environment.json`, selecciona el entorno y ejecuta la colección (el token y los ids se guardan automáticamente).

## Flujo de Git

`main` (versión final) · `develop` (integración) · `feature/*` (una por funcionalidad). Los cambios entran a `develop` por Pull Request con commits convencionales; la entrega se etiqueta `v2.0-avance2`.
