# Informe de ejecución

## Estado: completado con verificación automatizada y visual en navegador

## ETAPA 1 — Análisis

- Se analizó `App/` como versión anterior (Express + SQLite + React JS): endpoints, esquema, lógica de ventas con stock/transacción y ausencia de autenticación, usuarios, inventario dedicado, recetas editables y frontend Vanilla.
- Se definió una arquitectura con backend compartido y dos clientes (Vanilla y React) sobre la misma base SQLite.

## ETAPA 2 — Estructura

- Creados `backend/`, `frontend-vanilla/`, `frontend-react/` y `docs/`, además del `package.json` raíz con los scripts de ejecución.
- `App/` y el material original (diagrama, documentación .docx y presentación) se conservaron como referencia histórica/legacy, dentro de `docs/` cuando corresponde. La ejecución recomendada usa las carpetas nuevas.

## ETAPA 3 — Backend compartido

- Express + `better-sqlite3` con base en `backend/data/embriagados.db` (configurable con `DB_PATH`).
- CRUD de productos, categorías, ingredientes, clientes y usuarios; inventario sobre el stock real del producto; registro/listado/eliminación de ventas.
- Autenticación real: cookie HttpOnly `pg_session` validada contra la tabla `Session` en SQLite; `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- Clientes con `credentials: 'include'` y header `x-pos-client: pos-granizados`. `localStorage` no es prueba de autenticación.
- Roles: `admin` (acceso completo) y `cajero` (lectura de catálogos, inventario, ventas y recetas, y creación de ventas; sin Usuarios ni acciones de administración).
- Recetas: `GET/PUT /api/products/:productId/recipes` con reemplazo transaccional `{items:[{ingredientId,quantity}]}`.
- Seguridad: CORS whitelist, middleware de cliente, autenticación global, autorización por rol, cookie HttpOnly/SameSite=lax/Secure en producción, hash PBKDF2, passwords ausentes en respuestas y borrado de usuarios que limpia ventas/sesiones.
- Seed configurable con `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD` y `SEED_ADMIN_NAME`; desarrollo usa `admin / admin123` y producción exige las variables de seed. Variables adicionales: `PORT`, `DB_PATH`, `CORS_ORIGINS`, `SESSION_TTL_HOURS`, `COOKIE_SECURE`, `VITE_API_URL`.

## ETAPA 4 — Frontend Vanilla

- Cliente estático HTML/CSS/JS modular con Fetch a `http://localhost:3001/api`, servido en el puerto 5500.
- Módulos: login, dashboard, productos, categorías, ingredientes, clientes, usuarios, inventario, recetas y ventas.
- Patrón de render enlazado tras cada vista (`{html, bind}`) para evitar listeners duplicados.

## ETAPA 5 — Frontend React

- React + TypeScript + Vite + Tailwind, servido en el puerto 5173; `VITE_API_URL` apunta a `http://localhost:3001/api` y existe proxy `/api` como alternativa.
- Cliente HTTP con `credentials: 'include'` y `x-pos-client: pos-granizados`; páginas de login, dashboard, catálogos, usuarios, inventario, recetas y ventas.
- Verificado: `npm run typecheck`, `npm run lint` y `npm run build` OK.

## ETAPA 6 — Simultaneidad

- Scripts raíz existentes: `install:backend`, `install:react`, `install:all`, `dev:backend`, `start:backend`, `dev:vanilla`, `dev:react`, `build:react`, `test:backend`.
- Puertos: backend 3001, Vanilla 5500, React 5173. Ambos frontends comparten API y DB.

## ETAPA 7 — Pruebas

- Backend: `cd backend && npm test` -> **17/17 pass** (verificado nuevamente; la suite usa DB en memoria).
- React: `typecheck`, `lint` y `build` OK.
- Base oficial migrada para crear `Session` e índice `idx_product_ingredient_pair`, conservando 1 usuario y 5 productos.
- **Verificación visual completada:** backend, Vanilla y React se ejecutaron simultáneamente y se probaron con Chrome 158 headless vía CDP. Se validaron login admin/cajero, sesión compartida, recetas, categorías visibles en ambos frontends, permisos de cajero y registro de ventas en Vanilla y React. Los datos temporales se eliminaron y el stock quedó restaurado.

## ETAPA 8 — Documentación

- Actualizados README raíz, LEEME, documentación en `docs/Documentacion/`, informe y READMEs de ambos frontends para reflejar arquitectura real, auth por sesión, roles, recetas, variables de entorno, puertos, scripts, pruebas y validación visual completada.
- Durante la etapa documental no se modificó código de backend ni frontends; `App/COMO-ABRIR-LA-APP.md` y `App/Abrir-App.bat` sí se actualizaron para marcar esa carpeta como legacy. No se hizo commit ni push.
