# App legacy / historica

Esta carpeta corresponde a la version original/historica de Embriagados: React JS +
Express + SQLite. Se conserva como referencia y respaldo, pero **no es la version
recomendada ni la que se debe usar** para el POS Granizados actual.

La version vigente esta en la raiz del proyecto:

- `backend/`: API compartida con autenticacion por sesion, roles y recetas.
- `frontend-vanilla/`: cliente HTML/CSS/JS en `http://localhost:5500`.
- `frontend-react/`: cliente React + TypeScript en `http://localhost:5173`.
- DB oficial: `backend/data/embriagados.db`.

Usa los scripts `dev:backend`, `dev:vanilla` y `dev:react` desde la raiz.

## Iniciar la version legacy bajo su propio riesgo

Si necesitas abrir esta copia historica, sus puertos son backend 3001 y frontend
5173. No la inicies al mismo tiempo que la version vigente porque habra conflicto
de puertos y usara otra base de datos.

## Requisitos

- Windows.
- Node.js 20 instalado (probado con `v20.20.2`). Si usas otra version, ejecuta
  `npm install` en `backend` y `frontend` antes de abrir.
- Los puertos **3001** y **5173** libres.

## Abrir

1. Entra a la carpeta `App`.
2. Haz doble clic en `Abrir-App.bat`.
3. Se abriran dos ventanas negras: **Backend** y **Frontend**. No las cierres.
4. Espera unos segundos. El navegador abrira automaticamente
   http://localhost:5173.
5. Si el navegador no se abre, escribelo manualmente.

> No muevas `Abrir-App.bat` fuera de la carpeta `App`: el archivo usa rutas relativas.

## Cerrar

Cierra las dos ventanas negras (**Backend** y **Frontend**) o presiona `Ctrl+C` en cada una.

## Si algo falla

| Problema | Solucion |
| --- | --- |
| `npm no se reconoce` | Instala Node.js LTS desde https://nodejs.org y vuelve a intentar. |
| `EADDRINUSE` | Ya hay otra app usando el puerto 3001 o 5173. Cierra la otra instancia y reintenta. |
| La pagina carga pero sin datos | Espera unos segundos, revisa la ventana **Backend** y recarga el navegador. |
| Error de modulos | Abre `backend`, ejecuta `npm install`; haz lo mismo en `frontend` y vuelve a abrir la app. |
| Quiero reiniciar los datos | Cierra la app, borra `backend\data\embriagados.db` y vuelve a abrirla. |

La base de datos legacy se crea automaticamente en `backend\data\embriagados.db`.
