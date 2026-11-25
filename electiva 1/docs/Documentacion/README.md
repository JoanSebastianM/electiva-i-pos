# POS Granizados / EMBRIAGADOS CRUD — Documentación

Sistema web de gestión para un negocio de granizados y complementos. La versión oficial tiene **un backend Express + SQLite compartido** y **dos frontends** (Vanilla y React) que consumen la misma API y la misma base de datos. `App/` es la versión histórica/legacy, conservada pero no recomendada.

## Arquitectura general

```text
Vanilla (5500) ─┐
                ├─> API Express (3001) ─> SQLite: backend/data/embriagados.db
React    (5173) ─┘
```

Detalle en [ARQUITECTURA.md](ARQUITECTURA.md).

## Integrantes

| Nombre | Rol / principales tareas | Rama |
| --- | --- | --- |
| Nicolas Moreno | Módulo de Productos (backend + frontend) | `feature/nicolas-productos` |
| Joan Sebastian Mosquera Solis | Módulo de Ventas y validaciones (backend + frontend) | `feature/joan-ventas` |
| Ambos | Base del sistema, catálogos, clientes, auth, roles, docs y pruebas | `main` |

## Requisitos cubiertos

- Backend en Node.js + Express + SQLite con FK y WAL.
- CRUD de productos, categorías, ingredientes, clientes, usuarios e inventario; registro/eliminación de ventas.
- Recetas por producto con reemplazo transaccional.
- Autenticación por sesión HttpOnly `pg_session` validada en SQLite; roles `admin` y `cajero`.
- Dos frontends conectados a la API: HTML/CSS/JS y React + TypeScript + Vite + Tailwind.
- Arquitectura por capas con servicios y patrón Repository.
- Pruebas automatizadas del backend: **18/18 pass**.
- Documentación: este README, `ARQUITECTURA.md`, `TEST-CASES.md` y `CONTRIBUCION-GIT.md`.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Presentación | Vanilla JS + Fetch; React 18, Vite, TypeScript, Tailwind |
| Aplicación | Node.js 20, Express, middleware de auth y roles |
| Acceso a datos | Patrón Repository |
| Persistencia | SQLite (`better-sqlite3`), FK, WAL |
| Pruebas | `node:test` + supertest |

## Estructura actual

```text
arquitectura con ginna 1.1/
├── backend/
│   ├── app.js / server.js / db.js / seed.js / container.js
│   ├── middleware/auth.js
│   ├── routes/            # health, auth, users, products, recipes, categories,
│   │                      # ingredients, customers, inventory, sales
│   ├── services/          # CrudService, AuthService, SessionService, UserService,
│   │                      # RecipeService, InventoryService, SaleService, etc.
│   ├── repositories/      # Repository, SqliteRepository y repositorios concretos
│   ├── test/api.test.js
│   └── data/embriagados.db
├── frontend-vanilla/      # index.html, css/, js/ (api/client.js, pages/)
├── frontend-react/        # src/ (services/api.ts, hooks/, pages/, components/)
├── docs/                  # Diagrama, Documentacion, Presentacion, INFORME-EJECUCION.md
├── App/                   # legacy, no recomendado
└── package.json
```

## Ejecución

Requiere Node.js 20+. Desde la raíz:

```powershell
npm run install:all
npm run dev:backend      # puerto 3001
npm run dev:vanilla      # puerto 5500
npm run dev:react        # puerto 5173
```

Health: `GET http://localhost:3001/api/health`.

Pruebas:

```powershell
cd backend
npm test
```

Salida verificada: `tests 17 · pass 17 · fail 0`.

React:

```powershell
cd frontend-react
npm run typecheck
npm run lint
npm run build
```

## Autenticación y roles

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- La sesión se guarda en SQLite (tabla `Session`) y se envía como cookie HttpOnly `pg_session`; `SameSite=lax` y `Secure` en producción.
- Clientes: `credentials: 'include'` y header `x-pos-client: pos-granizados`. `localStorage` solo guarda datos de UI y **no es prueba de autenticación**.
- `admin`: acceso completo. `cajero`: lectura de catálogos, inventario, ventas y recetas, y creación de ventas; sin acceso a Usuarios ni acciones de administración.
- Desarrollo: `admin / admin123`. Producción: `SEED_ADMIN_USERNAME` y `SEED_ADMIN_PASSWORD` obligatorios.

Variables adicionales: `PORT`, `DB_PATH`, `CORS_ORIGINS`, `SESSION_TTL_HOURS`, `COOKIE_SECURE`, `VITE_API_URL`, `SEED_ADMIN_NAME`.

## Endpoints (API REST)

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/login` | Login y cookie de sesión |
| GET | `/api/auth/me` | Usuario de la sesión vigente |
| POST | `/api/auth/logout` | Cierra la sesión |
| GET/POST/PUT/DELETE | `/api/users[/:id]` | Usuarios (solo `admin`) |
| GET/POST/PUT/DELETE | `/api/products[/:id]` | Productos |
| GET/PUT | `/api/products/:productId/recipes` | Receta del producto; PUT reemplaza con `{items:[{ingredientId,quantity}]}` |
| GET/POST/PUT/DELETE | `/api/categories[/:id]` | Categorías |
| GET/POST/PUT/DELETE | `/api/ingredients[/:id]` | Ingredientes |
| GET/POST/PUT/DELETE | `/api/customers[/:id]` | Clientes |
| GET | `/api/inventory`, `/api/inventory/:id` | Inventario |
| PUT | `/api/inventory/:id` | Ajustar stock (solo `admin`) |
| GET/POST | `/api/sales` | Listar / registrar ventas |
| DELETE | `/api/sales/:id` | Eliminar venta y restaurar stock (solo `admin`) |

## Modelo de datos (SQLite)

- `Category(id, name)`, `Product(id, name, categoryId, price, stock)`.
- `Ingredient(id, name, unit, stock)`, `ProductIngredient(id, productId, ingredientId, quantity)` con índice único `idx_product_ingredient_pair`.
- `Customer(id, name, phone)`.
- `User(id, username, password, name, role, active, createdAt)` y `Session(id, userId, createdAt, expiresAt)`.
- `Sale(id, customerId, userId, createdAt, total)` y `SaleItem(id, saleId, productId, quantity, unitPrice, subtotal)`.

La base oficial `backend/data/embriagados.db` fue migrada para crear `Session` y el índice de receta, conservando 1 usuario y 5 productos.

## Reglas de ventas e inventario

- `total = cantidad × precio` actual del producto.
- No se permite vender más unidades que el stock disponible.
- Al vender se descuentan producto e ingredientes de su receta; al eliminar la venta se restauran.
- Venta, ítems y cambios de stock se ejecutan en una transacción; si falla algo, no se guarda ningún cambio.

## Colaboración y evidencia

- Git: [CONTRIBUCION-GIT.md](CONTRIBUCION-GIT.md).
- Casos de prueba: [TEST-CASES.md](TEST-CASES.md); automatizados 18/18 y verificación visual en navegador completada.
- Diagrama: [../Diagrama/diagrama-arquitectura.svg](../Diagrama/diagrama-arquitectura.svg).
- Presentación: [../Presentacion/Arquitectura-Embriagados.pptx](../Presentacion/Arquitectura-Embriagados.pptx).
- Backups: `Desktop/backup-pos-granizados-correcciones-20261124-090701` y ZIP originales en `Desktop`.
