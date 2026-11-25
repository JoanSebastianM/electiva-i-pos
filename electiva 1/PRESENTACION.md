# Guía rápida de presentación — POS Granizados

## Abrir la app actual

1. Entra en la carpeta raíz del proyecto.
2. Haz doble clic en `ABRIR-POS-GRANIZADOS.bat`.
3. Se abren tres ventanas: **Backend**, **React** y **Vanilla**. No las cierres durante la demo.
4. El navegador abre React en `http://localhost:5173` y Vanilla en `http://localhost:5500`.

Login: `admin / admin123`. Para probar permisos, usa también el usuario `cajero` creado en la base oficial.

## Servicios

| Servicio | Puerto | URL |
| --- | --- | --- |
| Backend | 3001 | `http://localhost:3001/api/health` |
| React | 5173 | `http://localhost:5173` |
| Vanilla | 5500 | `http://localhost:5500` |

La base oficial es `backend/data/embriagados.db`. Ambos frontends consumen la misma API y la misma base.

## Orden sugerido de demo

1. **Backend**: mostrar `http://localhost:3001/api/health`.
2. **Login admin**: entrar en React con `admin / admin123`.
3. **Productos**: buscar por nombre y usar el selector de orden por precio.
4. **Ventas**: armar una venta, revisar el resumen y confirmar; verificar descuento de stock.
5. **Recetas**: editar la receta de un producto desde React.
6. **Roles**: entrar como `cajero` y mostrar que no aparecen Usuarios ni acciones de administración.
7. **Vanilla**: abrir `http://localhost:5500` y mostrar que los mismos datos se ven en el otro frontend.

## Evidencia y seguimiento

- Jira: https://unimayor-team-jwt57jwx.atlassian.net/jira/software/projects/ELEC/summary
- GitHub: https://github.com/JoanSebastianM/electiva-i-pos
- Matriz de calificación: `docs/Documentacion/CALIFICACION-EVIDENCIA.md`
- Evidencia de texto: `docs/EVIDENCIA/`

La versión histórica y su iniciador fueron movidos a `Desktop\_backup_legacy_pos_granizados_20261125`; no se usan para la presentación.
