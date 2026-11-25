# Frontend Vanilla — POS Granizados

Cliente estático en HTML + CSS + JavaScript, servido en `http://localhost:5500`. Consume la misma API y la misma base de datos que el frontend React.

## Ejecutar

Requiere backend activo en `http://localhost:3001`. Desde la raíz del proyecto:

```powershell
npm run dev:vanilla
```

El script usa `npx http-server frontend-vanilla -p 5500 -c-1 --cors`. No hay dependencias propias que instalar en esta carpeta.

En otra terminal:

```powershell
npm run dev:backend
```

Health de la API: `http://localhost:3001/api/health`.

## Comunicación con la API

- Base fija: `http://localhost:3001/api` (definida en `js/api/client.js`).
- Todas las peticiones envían `credentials: 'include'` y el header `x-pos-client: pos-granizados`.
- La autenticación real es la cookie HttpOnly `pg_session`, validada por el backend en SQLite. Un valor en `localStorage` no autentica por sí mismo.
- El backend escucha en 3001; el puerto 5500 solo sirve archivos estáticos.

## Funcionalidades en la interfaz

Login, dashboard, productos, categorías, ingredientes, clientes, usuarios, inventario, recetas y ventas.

- Recetas: `GET/PUT /api/products/:productId/recipes`; `PUT` reemplaza la receta con `{items:[{ingredientId,quantity}]}` en una transacción.
- Productos: selector de orden por precio (`price_asc` / `price_desc`).
- Ventas: resumen previo y confirmación explícita antes de registrar.
- `admin`: acceso completo. `cajero`: lectura de catálogos/inventario/ventas/recetas y creación de ventas; sin Usuarios ni acciones de administración.
- Desarrollo: `admin / admin123`. En producción se requieren `SEED_ADMIN_USERNAME` y `SEED_ADMIN_PASSWORD` para el usuario inicial.

## Verificación

- Backend: `cd backend && npm test` -> 18/18 pass.
- Verificación visual de este frontend junto con React: completada en Chrome headless; login admin/cajero, recetas, permisos y ventas OK.

Más detalles en [../README.md](../README.md) y [../docs/Documentacion/TEST-CASES.md](../docs/Documentacion/TEST-CASES.md).
