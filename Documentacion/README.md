# EMBRIAGADOS CRUD — Proyecto Universitario

Sistema web con **CRUD completo** para la gestión de un negocio de granizados y complementos.
Backend en **Node.js + Express + SQLite** y frontend en **React + Vite** conectado a la API.

La aplicación sigue una **arquitectura por capas**:

```text
Presentación (React) → Aplicación (Express + servicios) → Acceso a datos (Repository) → Persistencia (SQLite)
```

Ver [ARQUITECTURA.md](ARQUITECTURA.md) para el detalle y el diagrama.

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
- [x] **Arquitectura por capas** con servicios y patrón Repository
- [x] **Pruebas automatizadas** (`node --test` + supertest): **18 pruebas**, todas pasando
- [x] **Git/GitHub** con ramas por integrante (`feature/nicolas-productos`, `feature/joan-ventas`)
- [x] **Documentación**: este README, `ARQUITECTURA.md`, `TEST-CASES.md` y `CONTRIBUCION-GIT.md`

## Tecnologias

| Capa        | Tecnologia                          |
| ----------- | ----------------------------------- |
| Presentación| React 18, Vite, react-router-dom    |
| Aplicación  | Node.js 20, Express                 |
| Acceso datos| Patrón Repository                   |
| Persistencia| SQLite (better-sqlite3, FK, WAL)    |
| Pruebas     | node:test + supertest               |

## Estructura del proyecto

```text
arquitectura con ginna 1.1/
├── App/                          # aplicacion ejecutable
│   ├── backend/
│   │   ├── server.js             # entrada: levanta Express (puerto 3001)
│   │   ├── app.js                # crea la app, monta rutas y manejo de errores
│   │   ├── db.js                 # conexion SQLite, tablas, FK y transacciones
│   │   ├── seed.js               # llena la base con datos de ejemplo
│   │   ├── container.js          # conecta repositorios y servicios
│   │   ├── errors/AppError.js    # errores de validacion (400) y no encontrado (404)
│   │   ├── routes/               # capa HTTP delgada
│   │   │   ├── createCrudRouter.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── ingredients.js
│   │   │   ├── customers.js
│   │   │   └── sales.js
│   │   ├── services/             # logica de negocio
│   │   │   ├── CrudService.js
│   │   │   ├── ProductService.js
│   │   │   ├── CategoryService.js
│   │   │   ├── IngredientService.js
│   │   │   ├── CustomerService.js
│   │   │   ├── InventoryService.js
│   │   │   └── SaleService.js
│   │   ├── repositories/         # acceso a datos
│   │   │   ├── Repository.js
│   │   │   ├── SqliteRepository.js
│   │   │   ├── ProductRepository.js
│   │   │   ├── CategoryRepository.js
│   │   │   ├── IngredientRepository.js
│   │   │   ├── CustomerRepository.js
│   │   │   ├── SaleRepository.js
│   │   │   ├── SaleItemRepository.js
│   │   │   └── ProductIngredientRepository.js
│   │   └── test/api.test.js      # pruebas automatizadas de la API
│   └── frontend/
│       ├── vite.config.js        # proxy /api -> localhost:3001
│       └── src/
│           ├── api.js            # cliente HTTP (fetch) para el backend
│           ├── utils/format.js   # formato de moneda
│           ├── hooks/useCrud.js
│           ├── hooks/useCrudForm.js
│           ├── pages/            # Productos, Categorias, Ingredientes, Clientes, Ventas
│           └── components/       # Navbar, Tabla, Formulario, Modal, Layout
├── Diagrama/                     # diagrama de arquitectura (svg y pdf)
├── Documentacion/                # documentacion del proyecto
├── Presentacion/                 # presentacion (pptx y pdf)
└── LEEME.md                      # resumen de la entrega
```

## Como ejecutar el proyecto

Necesitas **Node.js 20+** instalado.

### 1) Backend (terminal 1)

```bash
cd App/backend
npm install
npm start
```

La API queda en `http://localhost:3001`:
- Estado: `GET http://localhost:3001/api/health`
- Documentacion de rutas: ver [Endpoints](#endpoints)

### 2) Frontend (terminal 2)

```bash
cd App/frontend
npm install
npm run dev
```

Abre el navegador en **http://localhost:5173**. El frontend reenvia `/api/*` al backend
(proxy de Vite), asi no hay problemas de CORS en desarrollo.

### 3) Pruebas automatizadas

```bash
cd App/backend
npm test
```

Salida esperada: `tests 18 · pass 18 · fail 0`.

## Reglas de ventas e inventario

- Una venta toma el precio actual del producto y calcula `total = cantidad × precio`.
- No se permite vender una cantidad mayor al stock disponible.
- Al registrar una venta, el stock del producto se descuenta.
- Si el producto tiene receta, también se valida y descuenta el stock de sus ingredientes.
- Si falta stock de un ingrediente, la venta se rechaza y no se modifica ningún dato.
- Al eliminar una venta, se restauran el stock del producto y el de sus ingredientes.
- La venta, sus ítems y los cambios de stock se ejecutan en una **transacción**: si algo falla, no
  se guarda ningún cambio.

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
| POST   | `/api/sales`        | Registrar venta y descontar stock        |
| DELETE | `/api/sales/:id`    | Eliminar venta y restaurar stock         |

### Modelo de datos (SQLite)

- `Category(id, name)` — categorias (ej. Granizados)
- `Product(id, name, categoryId FK, price, stock)` — catalogo
- `Ingredient(id, name, unit, stock)` — insumos
- `ProductIngredient(id, productId FK, ingredientId FK, quantity)` — receta de cada producto
- `Customer(id, name, phone)` — clientes
- `Sale(id, customerId FK, total, createdAt)` — ventas
- `SaleItem(id, saleId FK, productId FK, quantity, unitPrice, subtotal)` — detalle de la venta

## Colaboracion en Git

Cada integrante trabaja en su propia rama y hace **sus propios commits** con su identidad
configurada. Ver [CONTRIBUCION-GIT.md](CONTRIBUCION-GIT.md).

## Documentacion y evidencia

- Arquitectura por capas: [ARQUITECTURA.md](ARQUITECTURA.md)
- Diagrama: [../Diagrama/diagrama-arquitectura.svg](../Diagrama/diagrama-arquitectura.svg)
- Casos de prueba: [TEST-CASES.md](TEST-CASES.md)
- Guia de git y tareas por integrante: [CONTRIBUCION-GIT.md](CONTRIBUCION-GIT.md)
- Presentacion: [../Presentacion/Arquitectura-Embriagados.pptx](../Presentacion/Arquitectura-Embriagados.pptx)
- Evidencia (videos/capturas y este proyecto): se sube a Google Drive compartido.
