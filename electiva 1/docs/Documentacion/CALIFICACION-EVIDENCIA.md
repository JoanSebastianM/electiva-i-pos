# Matriz de calificación y evidencia — cierre al 100%

## Enlaces oficiales

- Jira: https://unimayor-team-jwt57jwx.atlassian.net/jira/software/projects/ELEC/summary
- GitHub: https://github.com/JoanSebastianM/electiva-i-pos
- ZIP de presentación: `electiva 1.0-presentacion.zip`, adjunto en `ELEC-1`.
- ZIP anterior: `electiva 1.0-final.zip`, conservado solo como historial en Jira.

## Matriz requisito → evidencia

| Requisito calificado | Evidencia principal | Jira | GitHub | Estado |
| --- | --- | --- | --- | --- |
| 1. Registrar actividades y seguimiento del equipo en Jira; pegar link de Jira en comentario | 14 activities con responsables, estados y comentarios; tabla de seguimiento en `ELEC-13` | `ELEC-1` a `ELEC-14`; link de Jira y GitHub en comentarios | `docs/Documentacion/CALIFICACION-EVIDENCIA.md` | 100% |
| 3. Repositorio GitHub con carpeta `frontend-react`; pegar link de GitHub en comentarios de la actividad | `electiva 1/frontend-react`, 34 archivos en `src`, historial de commits y ramas | Comentarios de `ELEC-1` a `ELEC-14` con link exacto del repo | https://github.com/JoanSebastianM/electiva-i-pos | 100% |
| 4. Desarrollar parte del frontend en React usando todo lo visto en el corte | Componentes, props, hooks, Router, fetch, TypeScript, Tailwind, roles y formularios | `ELEC-9`; detalle en `ELEC-13` | `electiva 1/frontend-react/src/` | 100% |
| Nota: registrar avances en Jira y cambios en GitHub | Issues/estados/comentarios e historial de commits por rama | 14/14 `Finalizada` | `git log --oneline --graph --all` | 100% |
| Paquete listo para presentación | `ABRIR-POS-GRANIZADOS.bat`, `PRESENTACION.md`, carpeta sin legacy y ZIP de presentación | `ELEC-1` con ZIP y comentario de cierre | Commits finales en `main` | 100% |
| Cierre de tareas históricas pendientes | Orden por precio y confirmación de venta en backend, React y Vanilla | `ELEC-3`, `ELEC-4`, `ELEC-14` | Commits finales en `main` | 100% |

## Cobertura React documentada

| Tema | Evidencia en `frontend-react/src/` |
| --- | --- |
| Componentes funcionales y props tipadas | `main.tsx`, `App.tsx`, `components/Layout.tsx`, `components/DashboardCard.tsx`, `components/StyledButton.tsx`, `components/Notification.tsx` |
| Estado y hooks | `useState`, `useEffect`, `useMemo`, `useCallback` en `hooks/` y `pages/` |
| Custom hooks por dominio | `hooks/useAuth.ts`, `useProducts.ts`, `useSales.ts`, `useCategories.ts`, `useCustomers.ts`, `useIngredients.ts`, `useInventory.ts` |
| Rutas y navegación | `main.tsx` con `BrowserRouter`; `App.tsx` con `Routes`, `Route` y `Navigate`; `Layout.tsx` con `NavLink` y `Outlet` |
| Consumo de API | `services/api.ts` con `fetch`, `credentials: 'include'`, `x-pos-client` y abstracción `crud<T,P>` |
| TypeScript | `types/index.ts`, props tipadas, genéricos `http<T>` y `crud<T,P>`, eventos tipados |
| Estilos | Tailwind en `index.css`, `tailwind.config.js` y clases utility-first |
| Roles y sesión | `useAuth.ts`, guardas en `App.tsx`, navegación por rol en `Layout.tsx` |
| Formularios y validación | `LoginPage.tsx`, `ProductsPage.tsx`, `SalesPage.tsx`, `RecipesPage.tsx`, `InventoryPage.tsx`, `UsersPage.tsx` |
| Orden por precio | `ProductsPage.tsx` + `hooks/useProducts.ts` conectados a `?order=price_asc` / `price_desc` |
| Confirmación de venta | `SalesPage.tsx` con resumen previo y botón `Confirmar venta` |

## Evidencia de texto generada

- `docs/EVIDENCIA/backend-tests.txt`: salida completa de `npm test` (18/18).
- `docs/EVIDENCIA/react-checks.txt`: salida de `typecheck`, `lint` y `build`.
- `docs/EVIDENCIA/vanilla-syntax.txt`: resultado de `node --check` sobre 14 módulos.
- `docs/EVIDENCIA/git-log.txt`: historial final de commits y ramas.

No se generaron capturas de pantalla ni imágenes nuevas; la evidencia es documental, de logs de texto y de enlaces verificables.

## Cifra vigente y documentos históricos

- Cifra vigente: **18/18 pruebas del backend en verde**, React `typecheck`/`lint`/`build` OK y 14 módulos Vanilla con sintaxis OK.
- Los archivos `.docx` y `.pptx` originales que mencionan `10/10` o `14/14` son material histórico; la fuente de verdad es este documento, `README.md`, `LEEME.md` y `docs/Documentacion/TEST-CASES.md`.

## Pendientes

- Ninguno. `ELEC-14` quedó cerrada con el registro de cierre al 100%.
