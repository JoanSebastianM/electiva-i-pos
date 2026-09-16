# EMBRIAGADOS CRUD — Proyecto Universitario

Sistema web con **CRUD completo** para la gestión de un negocio de granizados y complementos.
Backend en **Node.js + Express + SQLite** y frontend en **React + Vite** conectado a la API.

## Integrantes

| Nombre        | Rol / principales tareas                                 | Rama                    |
| ------------- | -------------------------------------------------------- | ----------------------- |
| Nicolás       | Módulo de **Productos** (backend + frontend)             | `feature/nicolas-productos` |
| Joan          | Módulo de **Ventas** y validaciones (backend + frontend) | `feature/joan-ventas`   |
| Ambos         | Base del sistema, Categorías, Ingredientes, Clientes, docs y pruebas | `main`    |

## Requisitos de la rúbrica cubiertos

- [x] Backend en **Node.js + Express**
- [x] Base de datos **SQLite** con tablas relacionadas (FK)
- [x] **5 funcionalidades CRUD** completas: Productos, Categorías, Ingredientes, Clientes y Ventas
- [x] Frontend conectado al backend (fetch + API REST)
- [x] **Pruebas automatizadas** (`node --test` + supertest): 9 pruebas, todas pasando
- [x] **Git/GitHub** con ramas por integrante (`feature/nicolas-productos`, `feature/joan-ventas`)
- [x] **Documentación**: este README, `docs/TEST-CASES.md` y `docs/CONTRIBUCION-GIT.md`

## Tecnologias

| Capa      | Tecnologia                          |
| --------- | ----------------------------------- |
| Backend   | Node.js 20, Express, better-sqlite3 |
| Base datos| SQLite (tablas con claves foraneas) |
| Frontend  | React 18, Vite, react-router-dom    |
| Pruebas   | node:test + supertest               |

## Estructura del proyecto

```
universidad-embriagados/
├── backend/
│   ├── server.js          # entrada: levanta Express (puerto 3001)
│   ├── app.js             # crea la app, monta las rutas
│   ├── db.js              # conexion SQLite, tablas y FK, seed
│   ├── seed.js            # llena la base con datos de ejemplo
│   ├── routes/            # un router por entidad (CRUD)
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── ingredients.js
│   │   ├── customers.js
│   │   └── sales.js
│   └── test/api.test.js   # pruebas automatizadas de la API
└── frontend/
    ├── vite.config.js     # proxy /api -> localhost:3001
    └── src/
        ├── api.js         # cliente HTTP (fetch) para el backend
        ├── hooks/useCrud.js
        ├── pages/         # Productos, Categorias, Ingredientes, Clientes, Ventas
        └── components/    # Layout, Modal
```

## Como ejecutar el proyecto

Necesitas **Node.js 20+** instalado.

### 1) Backend (terminal 1)

```bash
cd backend
npm install
npm start
```

La API queda en `http://localhost:3001`:
- Estado: `GET http://localhost:3001/api/health`
- Documentacion de rutas: ver [Endpoints](#endpoints)

### 2) Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Abre el navegador en **http://localhost:5173**. El frontend reenvia `/api/*` al backend
(proxy de Vite), asi no hay problemas de CORS en desarrollo.

### 3) Pruebas automatizadas

```bash
cd backend
npm test
```

Salida esperada: `tests 9 · pass 9 · fail 0`.

## Endpoints (API REST)

| Metodo | Ruta                | Accion                                  |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/api/health`       | Estado del servidor                     |
| GET    | `/api/products`     | Listar productos (con categoria). `?search=` filtra |
| GET    | `/api/products/:id` | Obtener un producto                     |
| POST   | `/api/products`     | Crear producto                          |
| PUT    | `/api/products/:id` | Editar producto                         |
| DELETE | `/api/products/:id` | Eliminar producto                       |
| GET/POST/PUT/DELETE | `/api/categories[/:id]` | CRUD de categorias            |
| GET/POST/PUT/DELETE | `/api/ingredients[/:id]` | CRUD de ingredientes           |
| GET/POST/PUT/DELETE | `/api/customers[/:id]` | CRUD de clientes (con `?search=`) |
| GET    | `/api/sales`        | Listar ventas (total acumulado)         |
| POST   | `/api/sales`        | Registrar venta (calcula el total)       |
| DELETE | `/api/sales/:id`    | Eliminar venta                          |

### Modelo de datos (SQLite)

- `Category(id, name)` — categorias (ej. Granizados)
- `Product(id, name, categoryId FK, price, stock)` — catalogo
- `Ingredient(id, name, unit, stock)` — insumos
- `Customer(id, name, phone)` — clientes
- `Sale(id, productId FK, quantity, unitPrice, total, createdAt)` — ventas

## Colaboracion en Git

Cada integrante trabaja en su propia rama y hace **sus propios commits** con su identidad
configurada. Ver [docs/CONTRIBUCION-GIT.md](docs/CONTRIBUCION-GIT.md).

## Documentacion y evidencia

- Casos de prueba: [docs/TEST-CASES.md](docs/TEST-CASES.md)
- Guia de git y tareas por integrante: [docs/CONTRIBUCION-GIT.md](docs/CONTRIBUCION-GIT.md)
- Evidencia (videos/capturas y este proyecto): se sube a Google Drive compartido.