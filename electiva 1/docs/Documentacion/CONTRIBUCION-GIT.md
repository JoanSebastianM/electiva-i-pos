# Guía de Git y tareas por integrante

El proyecto tiene una base funcional en `main` con backend compartido y dos frontends. Cada integrante trabajó en su propia rama con sus propios commits y la integración final se hizo en `main`. Esta guía refleja la estructura actual: `backend/`, `frontend-vanilla/` y `frontend-react/`. La carpeta `App/` es legacy y no debe usarse como base de trabajo nuevo.

## Reglas importantes

- Cada integrante trabaja en su propia rama; no se hacen cambios directos en `main`.
- La identidad de Git se configura con el nombre real de cada integrante.
- Los commits deben ser claros y estar en español.
- Diferencias de contexto reales (fechas, datos del seed) son normales en un proyecto de equipo.
- Antes de integrar, ejecutar las pruebas del backend: `cd backend && npm test` (18/18).

## Rama de Nicolas Moreno: `feature/nicolas-productos`

Tarea histórica: filtro y ordenamiento en Productos.

```bash
git switch feature/nicolas-productos
```

Implementado en la estructura actual:

1. Backend: `backend/routes/products.js` y `backend/repositories/ProductRepository.js` soportan `?order=price_asc` / `price_desc` junto con la búsqueda por nombre.
2. Frontend React: `frontend-react/src/pages/ProductsPage.tsx` y `frontend-react/src/hooks/useProducts.ts` incluyen el selector de orden.
3. Frontend Vanilla: `frontend-vanilla/js/pages/products.js` incluye el mismo control.
4. Commits sugeridos:

```bash
git add backend
git commit -m "feat(productos): ordenar lista por precio en el backend"
git add frontend-react frontend-vanilla
git commit -m "feat(productos): selector de orden en los frontends"
```

## Rama de Joan Sebastian Mosquera Solis: `feature/joan-ventas`

Tarea histórica: validaciones y confirmación en Ventas.

```bash
git switch feature/joan-ventas
```

Implementado en la estructura actual:

1. `frontend-react/src/pages/SalesPage.tsx`: cantidad entera >= 1, resumen y botón `Confirmar venta` antes de registrar.
2. `frontend-vanilla/js/pages/sales.js`: misma validación y confirmación.
3. `backend/routes/sales.js`, `backend/services/SaleService.js` y `backend/services/InventoryService.js`: validación de stock y reversión transaccional.
4. Commits sugeridos:

```bash
git add backend
git commit -m "feat(ventas): validar stock y reversar cambios"
git add frontend-react frontend-vanilla
git commit -m "feat(ventas): confirmar resumen y control de cantidad"
```

## Rama de arquitectura: `feature/arquitectura-capas`

Tarea histórica: separación por capas, backend compartido y dos frontends.

1. `backend/`: rutas delgadas, servicios, repositorios, middleware de autenticación/roles y migraciones de esquema.
2. `frontend-react/` y `frontend-vanilla/`: clientes HTTP con `credentials: 'include'` y `x-pos-client: pos-granizados`.
3. `docs/`: documentación, diagrama y presentación.
4. Commits sugeridos:

```bash
git add backend
git commit -m "refactor(backend): capas, sesiones y recetas"
git add frontend-react frontend-vanilla
git commit -m "feat(frontends): consumir API compartida con sesion"
git add docs README.md LEEME.md
git commit -m "docs: actualizar arquitectura y pruebas"
```

## Integración final a `main`

```bash
git switch main
git merge feature/nicolas-productos
cd backend && npm test
git merge feature/joan-ventas
cd backend && npm test
```

Si hay conflictos, se resuelven conservando ambas funcionalidades y se hace commit con mensaje como `merge: resolver conflictos entre ramas`.

Antes de cerrar la integración, verificar también React:

```bash
cd frontend-react
npm run typecheck
npm run lint
npm run build
```

## Subir a GitHub

Repositorio documentado originalmente: **https://github.com/JoanSebastianM/electiva-i-pos** (dueño: Joan Sebastian Mosquera Solis; Nicolas Moreno como colaborador).

```bash
git clone https://github.com/JoanSebastianM/electiva-i-pos.git
```

Para HTTPS se usa usuario y Personal Access Token con scope `repo`. Desde GitHub se pueden crear Pull Requests de cada rama contra `main` para revisión.

## Comandos útiles

| Comando | Qué hace |
| --- | --- |
| `git status` | Ver archivos modificados |
| `git log --oneline --graph --all` | Ver historial y ramas |
| `git branch` | Ver ramas existentes |
| `git diff` | Revisar cambios antes de commit |

Para esta publicación de la entrega `electiva 1` se incluyó todo el contenido de la carpeta, incluidas dependencias y la base de datos, para que la versión subida quede autocontenida. La verificación visual en navegador ya fue ejecutada y registrada en `TEST-CASES.md`.
