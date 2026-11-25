# Frontend React — POS Granizados

React + TypeScript + Vite + Tailwind, servido en `http://localhost:5173`. Consume la misma API y la misma base de datos que el frontend Vanilla.

## Ejecutar

Desde la raíz del proyecto:

```powershell
npm run install:react
npm run dev:backend
npm run dev:react
```

También se puede trabajar dentro de la carpeta:

```powershell
cd frontend-react
npm install
npm run dev
```

## URL de la API

- `.env` define `VITE_API_URL=http://localhost:3001/api`.
- Si `VITE_API_URL` no está definido, el cliente usa `/api` y el proxy de Vite reenvía al backend en `http://localhost:3001`.
- Todas las peticiones de `src/services/api.ts` envían `credentials: 'include'` y `x-pos-client: pos-granizados`.
- La sesión real es la cookie HttpOnly `pg_session` validada en SQLite; `localStorage` solo guarda datos de interfaz y no es prueba de autenticación.

## Scripts disponibles

| Script | Acción |
| --- | --- |
| `dev` | Servidor de desarrollo en 5173 |
| `build` | Build de producción |
| `typecheck` | Verificación TypeScript |
| `lint` | ESLint |
| `preview` | Vista previa del build |

Desde la raíz también existen `npm run dev:react` y `npm run build:react`.

## Funcionalidades en la interfaz

Login, dashboard, productos, categorías, ingredientes, clientes, usuarios, inventario, recetas y ventas.

- Recetas: `GET/PUT /api/products/:productId/recipes`; `PUT` reemplaza la receta con `{items:[{ingredientId,quantity}]}` en una transacción.
- `admin`: acceso completo. `cajero`: lectura de catálogos/inventario/ventas/recetas y creación de ventas; sin Usuarios ni acciones de administración.
- Desarrollo: `admin / admin123`. Producción exige `SEED_ADMIN_USERNAME` y `SEED_ADMIN_PASSWORD` para crear el usuario inicial.

## Verificación

Los siguientes comandos pasaron:

```powershell
cd frontend-react
npm run typecheck
npm run lint
npm run build
```

Backend: `cd backend && npm test` -> 17/17 pass. La verificación visual simultánea con Vanilla se completó en Chrome headless; login admin/cajero, recetas, permisos y ventas OK.

Más detalles en [../README.md](../README.md) y [../docs/Documentacion/TEST-CASES.md](../docs/Documentacion/TEST-CASES.md).
