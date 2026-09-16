# Guía de Git y tareas por integrante

El proyecto ya tiene una **base funcional** en `main` con las 5 funcionalidades CRUD.
Para demostrar participacion, cada integrante agrega una mejora **sobre su propio modulo**
en su propia rama, con **sus propios commits**, y al final se integra a `main`.

## Reglas importantes

- Cada integrante trabaja en su **propia rama** (nunca en `main` directamente).
- La identidad de git se configura con el nombre real de cada uno (ver paso 1).
- Se hacen **al menos 2 commits** con mensajes claros y en espanol.
- Diferencias de contexto reales (fechas, datos del seed) son normales en proyectos de equipo.
- El otro integrante puede revivir inmediatamente con `git log` cuando se integre.

## Rama de Nicolás: `feature/nicolas-productos`

Tarea: agregar **filtro avanzado y ordenamiento** al modulo de Productos.

Pasos:

```bash
git switch feature/nicolas-productos
```

1. **Backend** (`backend/routes/products.js`): permitir ordenar la lista con `?order=price_asc`
   o `?order=price_desc` además de la busqueda por nombre existente.
2. **Frontend** (`frontend/src/pages/Productos.jsx`): agregar un `<select>` junto al buscador
   con "Ordenar por: Nombre / Precio (menor) / Precio (mayor)" que recargue la tabla.
3. Hacer **2 o 3 commits**:

```bash
git add .
git commit -m "feat(productos): ordenar lista por precio en el backend"
git commit -m "feat(productos): selector de orden y busqueda en la tabla"
```

> Tip: para recargar tras cambiar el orden usa el `search` del hook `useCrud`, o llama a `reload()`.

## Rama de Joan: `feature/joan-ventas`

Tarea: agregar **validaciones y vista previa** al modulo de Ventas.

Pasos:

```bash
git switch feature/joan-ventas
```

1. **Frontend** (`frontend/src/pages/Ventas.jsx`): la cantidad no debe permitir valores no
   enteros ni menores a 1 (ya se valida, haz que el input también lo impida: `step="1"`).
2. **Frontend**: mostrar un mensaje de confirmacion con el resumen antes de registrar
   (producto, cantidad y total) usando `confirm(...)`.
3. **Backend** (`backend/routes/sales.js`): impedir registrar una venta si la cantidad supera
   el stock del producto (respuesta 400 con mensaje claro).
4. Hacer **2 o 3 commits**:

```bash
git add .
git commit -m "feat(ventas): validar stock disponible al registrar"
git commit -m "feat(ventas): confirmar resumen de venta y control de cantidad"
```

## Integracion final a main

```bash
git switch main
git merge feature/nicolas-productos      # primera integracion
npm test                                   # verificar que siga en verde
git merge feature/joan-ventas             # segunda integracion
npm test                                   # verificar de nuevo
```

Si hay conflictos, se resuelven dejando ambas funcionalidades y se hace commit con
`git commit` (mensaje: `merge: resolver conflictos entre ramas`).

## Subir a GitHub

```bash
# en GitHub: New repository -> universal-embriagados (privado o publico)
git remote add origin https://github.com/UsuarioGit/universal-embriagados.git
git branch -M main
git push -u origin main
git push -u origin feature/nicolas-productos
git push -u origin feature/joan-ventas
```

Desde GitHub se pueden crear **Pull Requests** de cada rama contra `main` para que el otro
integrante las revise. Queda demostrada la colaboracion con ramas.

## Comandos utiles

| Comando                  | Que hace                                  |
| ------------------------ | ----------------------------------------- |
| `git status`             | Ver archivos modificados                  |
| `git log --oneline --graph --all` | Ver historial y ramas             |
| `git branch`             | Ver ramas existentes                      |

Recordatorio: nunca enviar `node_modules/` ni `backend/data/` (ya estan en `.gitignore`).