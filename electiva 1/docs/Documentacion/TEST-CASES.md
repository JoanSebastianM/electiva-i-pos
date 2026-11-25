# Casos de prueba — POS Granizados / EMBRIAGADOS CRUD

Este documento separa la evidencia **automatizada verificada** de la **verificación visual en navegador ejecutada**. No quedan casos pendientes.

Leyenda: `OK (automático)` = cubierto por la suite `cd backend && npm test`; `OK (navegador)` = ejecutado con Chrome headless mediante CDP sobre los servicios reales.

## Pruebas automatizadas verificadas

Comando:

```powershell
cd backend
npm test
```

Resultado: **tests 17 · pass 17 · fail 0**. La suite usa una base SQLite en memoria y no modifica `backend/data/embriagados.db`.

| # | Funcionalidad | Caso cubierto | Resultado |
| --- | --- | --- | --- |
| A1 | Health | `GET /api/health` responde `ok: true` | OK (automático) |
| A2 | Auth | Login válido, inválido y sin password; `GET /api/auth/me` devuelve usuario sin `password` | OK (automático) |
| A3 | Seguridad | Sin sesión -> 401; sin `x-pos-client` en escritura -> 403; con header pero sin sesión -> 401 | OK (automático) |
| A4 | Auth | `POST /api/auth/logout` invalida la sesión; petición posterior -> 401 | OK (automático) |
| A5 | Roles | `cajero` lee productos y crea ventas; no crea productos, no ve usuarios, no ajusta inventario, no elimina ventas ni reemplaza recetas | OK (automático) |
| A6 | Usuarios | CRUD, rol inválido -> 400, respuestas sin `password`, borrado -> 200 | OK (automático) |
| A7 | Productos | CRUD completo; `GET` tras borrar -> 404 | OK (automático) |
| A8 | Productos | Crear sin nombre -> 400 | OK (automático) |
| A9 | Categorías | CRUD completo | OK (automático) |
| A10 | Ingredientes | CRUD completo | OK (automático) |
| A11 | Clientes | CRUD completo | OK (automático) |
| A12 | Inventario | Listado y ajuste de stock | OK (automático) |
| A13 | Recetas | `PUT` guarda y reemplaza la receta; `GET` devuelve los ingredientes con nombre | OK (automático) |
| A14 | Ventas | Descuenta y restaura stock de producto e ingredientes; asocia `userId` de la sesión | OK (automático) |
| A15 | Ventas | Stock insuficiente -> 400 y stock sin cambios | OK (automático) |
| A16 | Ventas | Error en una venta con ítems -> reversión transaccional; stock previo intacto | OK (automático) |
| A17 | CORS | Origen `http://localhost:5173` permitido con credenciales; origen externo bloqueado | OK (automático) |

Comprobaciones adicionales ya ejecutadas en este proyecto:

| Verificación | Resultado |
| --- | --- |
| `cd frontend-react && npm run typecheck` | OK |
| `cd frontend-react && npm run lint` | OK |
| `cd frontend-react && npm run build` | OK |
| Sintaxis de 14 módulos JS de Vanilla | OK |
| Base oficial migrada (`Session` e `idx_product_ingredient_pair`), 1 usuario y 5 productos conservados | OK |
| Smoke HTTP con cookie y header de cliente | 401 sin sesión; 200 en login, me, catálogos, recetas y logout |

## Verificación visual ejecutada en navegador

Entorno: Chrome 158 headless controlado por CDP, con backend en `3001`, Vanilla en `5500` y React en `5173` ejecutándose al mismo tiempo.

| # | Funcionalidad | Acción ejecutada | Resultado |
| --- | --- | --- | --- |
| G1 | Health | Petición HTTP real al backend desde Windows | JSON con `ok: true` |
| G2 | Vanilla | Login `admin / admin123` | Panel con módulos y usuario admin |
| G3 | React | Login `admin / admin123` | Panel con módulos y usuario admin |
| G4 | Sesión | Cada frontend cargó el usuario desde `/auth/me` | Usuario de sesión HttpOnly visible |
| G5 | Cierre de sesión | Logout explícito antes de cambiar de usuario | Login mostrado nuevamente |
| G6 | Categorías | Categoría temporal creada por API | Visible en Vanilla y React |
| G7 | Recetas | Navegación admin a Recetas | Editor visible en ambos frontends |
| G8 | Productos | Catálogo cargado desde la API compartida | 5 productos visibles en ambos |
| G9 | Ventas admin | Pantalla de Ventas cargada en ambos frontends | Historial y formulario presentes |
| U1 | Usuarios admin | Navegación a Usuarios | Formulario y listado visibles |
| RO1 | Roles cajero | Login con usuario `cajero` temporal en ambos frontends | Sin Usuarios ni acciones de administración |
| RO2 | Recetas cajero | Navegación a Recetas | Listado visible, editor ausente |
| V1 | Ventas cajero | Registro de una venta en Vanilla y otra en React | Ambas ventas creadas por backend |
| X1 | Integración | Mismo backend y DB para ambos frontends | Categoría y ventas reflejadas en API |
| C1 | Limpieza | Eliminación de ventas, usuario y categoría temporales | Stock restaurado y 0 ventas restantes |

## Evidencia disponible

- Salida de `npm test`: 17/17 pass.
- Salida de `typecheck`, `lint` y `build` de React.
- Resultado del smoke HTTP: `401` sin sesión y `200` en rutas autenticadas.
- Resultado de verificación CDP: login admin/cajero, permisos, recetas, categorías y ventas OK en ambos frontends.
- Backups disponibles: `Desktop/backup-pos-granizados-correcciones-20261124-090701` y ZIP originales en `Desktop`.
