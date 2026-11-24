# Arquitectura con Ginna 1.1

Entrega final del proyecto **Embriagados CRUD**, organizado por capas y listo para ejecutar.

- **Presentación:** React 18 + Vite.
- **Aplicación:** Node.js + Express.
- **Acceso a datos:** patrón Repository.
- **Persistencia:** SQLite con `better-sqlite3` (claves foráneas y WAL).

## Contenido

### App

| Ruta | Descripción |
| --- | --- |
| `App/Abrir-App.bat` | Inicia backend y frontend y abre el navegador. |
| `App/COMO-ABRIR-LA-APP.md` | Guía corta de requisitos y solución de problemas. |
| `App/backend/` | API Express + SQLite en el puerto 3001. |
| `App/frontend/` | Interfaz React + Vite en el puerto 5173. |

### Documentación

- `Documentacion/ADD - Arquitectura por Capas - Embriagados CRUD.docx`
- `Documentacion/ARQUITECTURA.md`
- `Documentacion/README.md`
- `Documentacion/TEST-CASES.md`
- `Documentacion/CONTRIBUCION-GIT.md`
- `Documentacion/Casos_de_prueba.docx`
- `Documentacion/Guia_de_ejecucion.docx`
- `Documentacion/Guia_de_evidencia.docx`

## Cómo ejecutar

1. Entra a la carpeta `App`.
2. Haz doble clic en `Abrir-App.bat`.
3. Espera a que abran las ventanas de Backend y Frontend.
4. Abre http://localhost:5173 si el navegador no se abre solo.

Ejecución manual:

```bash
# Backend
cd App/backend
npm install
npm start

# Frontend (otra terminal)
cd App/frontend
npm install
npm run dev

# Pruebas del backend
cd App/backend
npm test
```

## Verificación

- Pruebas del backend: **18 de 18** (`node --test` + supertest).
- Build del frontend: `npm run build` con Vite.
- La base de datos se crea sola en `App/backend/data/embriagados.db`.

## Organización aplicada

- **Capa 1 (presentación):** `api.js` solo contiene el cliente HTTP; `utils/format.js` concentra el formato de moneda; `hooks/useCrud.js` reutiliza el estado CRUD y `hooks/useCrudForm.js` el estado de los formularios; `components/` y `pages/` mantienen la interfaz.
- **Capa 2 (aplicación):** rutas delgadas, servicios con validaciones y reglas de negocio. `CrudService` concentra el CRUD común y `SaleService` coordina las ventas con `InventoryService`.
- **Capa 3 (acceso a datos):** contrato `IRepository`, base `SQLiteRepository` y un repositorio por entidad (`Product`, `Category`, `Ingredient`, `Customer`, `Sale`, `SaleItem`, `ProductIngredient`).
- **Capa 4 (persistencia):** `db.js` define el esquema, los datos de ejemplo y las transacciones.

## Reglas de ventas e inventario

- El total se calcula con el precio actual del producto.
- No se permite vender más unidades que el stock disponible.
- Al registrar una venta se descuenta el stock del producto y el de los ingredientes de su receta.
- Si no hay stock suficiente de un ingrediente, la venta se rechaza y no se modifica nada.
- Al eliminar una venta se restauran el stock del producto y el de sus ingredientes.
- La venta, los ítems y los cambios de stock se ejecutan en una sola transacción.

