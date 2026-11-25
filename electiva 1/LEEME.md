# Arquitectura con Ginna 1.1

Entrega actual del proyecto **POS Granizados / Embriagados CRUD**. La ejecución oficial usa **backend compartido + dos frontends** sobre la misma base SQLite. `App/` queda conservada como versión histórica/legacy, pero no se recomienda usarla.

## Integrantes

| Nombre | Rol / principales tareas | Rama |
| --- | --- | --- |
| Joan Sebastian Mosquera Solis | Módulo de Ventas y validaciones (backend + frontend) | `feature/joan-ventas` |
| Nicolas Moreno | Módulo de Productos (backend + frontend) | `feature/nicolas-productos` |
| Ambos | Base del sistema, catálogos, clientes, auth, roles, documentación y pruebas | `main` |

## Estado actual

```text
arquitectura con ginna 1.1/
├── backend/            # Express + SQLite en backend/data/embriagados.db (puerto 3001)
├── frontend-vanilla/   # HTML/CSS/JS + Fetch (puerto 5500)
├── frontend-react/     # React + TypeScript + Vite + Tailwind (puerto 5173)
├── docs/               # Diagrama, documentación, presentación e informe
├── App/                # legacy: backend + frontend anteriores (referencia histórica)
└── package.json        # scripts raíz
```

- Presentación: Vanilla y React, ambos consumen `http://localhost:3001/api`.
- Aplicación: Node.js + Express con rutas, middleware y servicios.
- Acceso a datos: patrón Repository.
- Persistencia: SQLite con `better-sqlite3`, claves foráneas y WAL.

## Contenido

### Aplicación oficial

| Ruta | Descripción |
| --- | --- |
| `backend/` | API Express + SQLite compartida, auth por sesión, roles y recetas. |
| `frontend-vanilla/` | Cliente estático en el puerto 5500. |
| `frontend-react/` | Cliente React + TS + Vite en el puerto 5173. |

### Legacy

| Ruta | Descripción |
| --- | --- |
| `App/Abrir-App.bat` | Iniciador de la versión anterior. |
| `App/COMO-ABRIR-LA-APP.md` | Guía histórica de requisitos y solución de problemas. |
| `App/backend/` | API anterior. |
| `App/frontend/` | Frontend React anterior. |

### Documentación y material

- `docs/Diagrama/diagrama-arquitectura.svg` y `.pdf`
- `docs/Documentacion/README.md`, `ARQUITECTURA.md`, `CONTRIBUCION-GIT.md`, `TEST-CASES.md`
- `docs/Documentacion/*.docx`: documentos originales de la entrega
- `docs/Presentacion/Arquitectura-Embriagados.pptx` y `.pdf`
- `docs/INFORME-EJECUCION.md`

## Cómo ejecutar (recomendado)

Requiere Node.js 20+ y npm. Desde la raíz:

```powershell
npm run install:all
```

En tres terminales:

```powershell
npm run dev:backend
```

```powershell
npm run dev:vanilla
```

```powershell
npm run dev:react
```

URLs: backend `http://localhost:3001`, Vanilla `http://localhost:5500`, React `http://localhost:5173`.

Scripts raíz disponibles: `install:backend`, `install:react`, `install:all`, `dev:backend`, `start:backend`, `dev:vanilla`, `dev:react`, `build:react`, `test:backend`.

## Autenticación, roles y configuración

- Login: `POST /api/auth/login`; sesión: `GET /api/auth/me`; salida: `POST /api/auth/logout`.
- La cookie `pg_session` es HttpOnly y se valida en la tabla `Session` de SQLite.
- Los clientes envían `credentials: 'include'` y `x-pos-client: pos-granizados`. `localStorage` no prueba autenticación.
- `admin`: acceso completo. `cajero`: lectura de catálogos/inventario/ventas/recetas y creación de ventas; sin Usuarios ni administración.
- Recetas: `GET/PUT /api/products/:productId/recipes`, con reemplazo transaccional `{items:[{ingredientId,quantity}]}`.
- Variables: `PORT`, `DB_PATH`, `CORS_ORIGINS`, `SESSION_TTL_HOURS`, `COOKIE_SECURE`, `VITE_API_URL`, `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`.
- Desarrollo: `admin / admin123`. Producción: exige variables de seed para crear el usuario inicial.

## Verificación

- Backend: `cd backend && npm test` -> **17/17 pass** (verificado).
- React: `npm run typecheck`, `npm run lint`, `npm run build` -> OK (verificado).
- Base oficial migrada: tabla `Session` e índice `idx_product_ingredient_pair`; se conservaron 1 usuario y 5 productos.
- **Verificado:** Vanilla y React se probaron simultáneamente en Chrome headless: login admin/cajero, recetas, permisos, visibilidad cruzada de datos y registro de ventas; ver checklist en [README.md](README.md).

## Backups

- `Desktop/backup-pos-granizados-correcciones-20261124-090701` (`db-oficial/` y `proyecto/`).
- ZIP originales en `Desktop`: `APP.zip`, `electiva 1.0.zip`, `arquitectura con ginna 1.1.zip`, `arquitectura con ginna 1.1 (2).zip`.

## Reglas de ventas e inventario

- El total se calcula con el precio actual del producto.
- No se permite vender más unidades que el stock disponible.
- Al registrar una venta se descuentan producto e ingredientes de su receta; si falla algo, la transacción revierte todos los cambios.
- Al eliminar una venta se restauran el stock del producto y el de sus ingredientes.
