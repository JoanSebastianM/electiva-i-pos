# POS Granizados

Proyecto reorganizado con **backend Express + SQLite compartido**, **frontend Vanilla** y **frontend React** consumiendo la misma API y la misma base de datos. Para presentar, haz doble clic en `ABRIR-POS-GRANIZADOS.bat` desde la raíz.

## Integrantes

| Nombre | Rol / principales tareas | Rama |
| --- | --- | --- |
| Joan Sebastian Mosquera Solis | Módulo de Ventas y validaciones (backend + frontend) | `feature/joan-ventas` |
| Nicolas Moreno | Módulo de Productos (backend + frontend) | `feature/nicolas-productos` |
| Ambos | Base del sistema, catálogos, clientes, auth, roles, documentación y pruebas | `main` |

## Arquitectura real

```text
arquitectura con ginna 1.1/
├── backend/            # API Express + SQLite compartida
├── frontend-vanilla/   # HTML + CSS + JS + Fetch (puerto 5500)
├── frontend-react/     # React + TypeScript + Vite + Tailwind (puerto 5173)
├── docs/               # Diagrama, documentación, evidencia e informe
├── ABRIR-POS-GRANIZADOS.bat  # iniciador de la entrega actual
├── PRESENTACION.md     # guía rápida de demo
├── package.json        # scripts raíz
└── README.md
```

- Backend: `Node.js + Express + better-sqlite3`, base en `backend/data/embriagados.db`.
- Vanilla: peticiones directas a `http://localhost:3001/api`.
- React: usa `VITE_API_URL` (en `.env`: `http://localhost:3001/api`) o `/api` con el proxy de Vite hacia el puerto 3001.
- Ambos frontends comparten la API y la base de datos; no tienen una DB propia.

## Puertos y scripts raíz

| Servicio | Puerto | URL |
| --- | --- | --- |
| Backend | 3001 | `http://localhost:3001` (health: `/api/health`) |
| Vanilla | 5500 | `http://localhost:5500` |
| React | 5173 | `http://localhost:5173` |

Scripts disponibles en `package.json` (raíz):

| Script | Acción |
| --- | --- |
| `install:backend` | `npm --prefix backend install` |
| `install:react` | `npm --prefix frontend-react install` |
| `install:all` | Instala backend y React |
| `dev:backend` | Backend con `node --watch` |
| `start:backend` | Backend sin watch |
| `dev:vanilla` | Sirve `frontend-vanilla` con `http-server` en 5500 |
| `dev:react` | Inicia Vite en 5173 |
| `build:react` | Build de producción de React |
| `test:backend` | Pruebas del backend |

## Funcionalidades cubiertas

- Productos, categorías, ingredientes, clientes y usuarios (CRUD).
- Inventario: listado y ajuste de stock sobre el `stock` real del producto.
- Ventas: registro, listado y eliminación con total calculado desde el precio actual.
- Recetas: consulta y reemplazo transaccional por producto.
- Descuento y restauración de stock de producto e ingredientes; reversión transaccional si falla cualquier parte de la venta.

## Autenticación y roles

La autenticación real es **sesión en servidor**, no `localStorage`:

- `POST /api/auth/login` crea una sesión y devuelve la cookie HttpOnly `pg_session`.
- `GET /api/auth/me` valida la cookie contra la tabla `Session` en SQLite y devuelve el usuario.
- `POST /api/auth/logout` elimina la sesión y limpia la cookie.
- Los clientes envían `credentials: 'include'` y el header `x-pos-client: pos-granizados` en las peticiones a `/api`.
- `localStorage` se usa solo como caché de la interfaz; **no es prueba de autenticación**. La autoridad es la sesión validada por el backend.

Roles:

| Rol | Permisos |
| --- | --- |
| `admin` | Acceso completo: catálogos, inventario, usuarios, recetas, ventas y eliminación de ventas. |
| `cajero` | Lectura de catálogos, inventario, ventas y recetas, y creación de ventas. Sin Usuarios ni acciones de administración. |

Endpoints de recetas:

| Método | Ruta | Cuerpo / resultado |
| --- | --- | --- |
| GET | `/api/products/:productId/recipes` | Lista de ingredientes de la receta. |
| PUT | `/api/products/:productId/recipes` | Reemplazo transaccional con `{ "items": [{ "ingredientId": 1, "quantity": 100 }] }`. |

## Seguridad

- CORS con whitelist: por defecto `http://localhost:5500,http://localhost:5173`.
- Middleware de cliente: `x-pos-client: pos-granizados` requerido para POST/PUT/PATCH/DELETE.
- Autenticación global en `/api` (excepto health y login) y autorización por rol.
- Cookie `pg_session`: HttpOnly, `SameSite=lax`, `Secure` en producción o si `COOKIE_SECURE=true`.
- Passwords hasheados con PBKDF2; la respuesta de usuarios nunca incluye `password`.
- Al borrar un usuario se limpian sus ventas (`userId` a NULL) y sus sesiones en una transacción.

## Configuración

| Variable | Uso | Valor por defecto / nota |
| --- | --- | --- |
| `PORT` | Puerto del backend | `3001` |
| `DB_PATH` | Ruta SQLite | `backend/data/embriagados.db` |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma | `http://localhost:5500,http://localhost:5173` |
| `SESSION_TTL_HOURS` | Duración de la sesión | `8` horas |
| `COOKIE_SECURE` | Forzar cookie Secure | `true` también lo activa en desarrollo |
| `VITE_API_URL` | URL base de la API en React | `http://localhost:3001/api` |
| `SEED_ADMIN_USERNAME` | Usuario admin inicial | `admin` |
| `SEED_ADMIN_PASSWORD` | Password admin inicial | `admin123` solo en desarrollo |
| `SEED_ADMIN_NAME` | Nombre admin inicial | `Administrador` |

En producción, `SEED_ADMIN_USERNAME` y `SEED_ADMIN_PASSWORD` son obligatorios para crear el usuario inicial. Si la base ya tiene usuarios, el seed de usuarios no se ejecuta.

## Instalación y ejecución

Forma recomendada: desde la raíz, haz doble clic en `ABRIR-POS-GRANIZADOS.bat`. El iniciador instala lo que falte, levanta backend, React y Vanilla, y abre `http://localhost:5173` y `http://localhost:5500`.

Forma manual, desde la raíz en PowerShell:

```powershell
npm run install:all
```

Tres terminales en la raíz:

```powershell
npm run dev:backend
```

```powershell
npm run dev:vanilla
```

```powershell
npm run dev:react
```

Vanilla no requiere instalación de dependencias propias.

## Pruebas y verificación

```powershell
cd backend
npm test
```

Resultado verificado: **18/18 pruebas en verde** (suite con base en memoria).

React (verificado también):

```powershell
cd frontend-react
npm run typecheck
npm run lint
npm run build
```

La base oficial `backend/data/embriagados.db` fue migrada para crear la tabla `Session` y el índice único `idx_product_ingredient_pair`, conservando **1 usuario y 5 productos**.

**Verificación visual completada:** se ejecutaron backend, Vanilla y React de forma simultánea y se validaron ambos frontends con Chrome 158 headless mediante CDP. Login `admin` y `cajero`, sesión compartida, recetas admin, visibilidad de datos creados por API en ambos frontends, permisos de `cajero` y registro de ventas en Vanilla y React quedaron verificados. Los datos temporales se eliminaron y el stock quedó restaurado.

## Checklist ejecutado (Vanilla ↔ React)

1. Backend, Vanilla y React iniciados simultáneamente; 3001, 5500 y 5173 respondieron.
2. Login `admin / admin123` ejecutado en Vanilla y React; usuario de sesión mostrado en ambos paneles.
3. Categoría temporal creada por API y visualizada en los dos frontends.
4. Editor de recetas visible para `admin` en ambos frontends y solo lectura para `cajero`.
5. `cajero` creó una venta en Vanilla y otra en React; backend registró ambas con la sesión correcta.
6. `cajero` no vio Usuarios ni formularios/accciones de administración.
7. Ventas temporales, usuario y categoría eliminados; stock de productos restaurado; 0 ventas restantes.
8. `GET /api/auth/me` y logout validados previamente por API y suite automatizada.

## Backups

- Carpeta: `Desktop/backup-pos-granizados-correcciones-20261124-090701` (incluye `db-oficial/` y `proyecto/`).
- ZIP originales en `Desktop`: `APP.zip`, `electiva 1.0.zip`, `arquitectura con ginna 1.1.zip` y `arquitectura con ginna 1.1 (2).zip`.

## Documentación

- Guía corta: [LEEME.md](LEEME.md)
- Guía de presentación: [PRESENTACION.md](PRESENTACION.md)
- Documentación: [docs/Documentacion/README.md](docs/Documentacion/README.md)
- Arquitectura: [docs/Documentacion/ARQUITECTURA.md](docs/Documentacion/ARQUITECTURA.md)
- Git: [docs/Documentacion/CONTRIBUCION-GIT.md](docs/Documentacion/CONTRIBUCION-GIT.md)
- Casos de prueba: [docs/Documentacion/TEST-CASES.md](docs/Documentacion/TEST-CASES.md)
- Informe: [docs/INFORME-EJECUCION.md](docs/INFORME-EJECUCION.md)
- Matriz de calificación: [docs/Documentacion/CALIFICACION-EVIDENCIA.md](docs/Documentacion/CALIFICACION-EVIDENCIA.md)
- Frontends: [frontend-vanilla/README.md](frontend-vanilla/README.md) y [frontend-react/README.md](frontend-react/README.md)

## Entrega y seguimiento

- Jira: https://unimayor-team-jwt57jwx.atlassian.net/jira/software/projects/ELEC/summary
- GitHub: https://github.com/JoanSebastianM/electiva-i-pos
- Estado: 14/14 actividades `Finalizada`; sin pendientes.
