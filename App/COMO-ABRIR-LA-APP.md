# Como abrir la app

Aplicacion web **Embriagados CRUD**: React + Vite en el frontend y Node.js + Express con
SQLite en el backend.

## Requisitos

- Windows.
- Node.js 20 instalado (probado con `v20.20.2`). Si usas otra version, ejecuta
  `npm install` en `backend` y `frontend` antes de abrir.
- Los puertos **3001** y **5173** libres.

## Abrir

1. Entra a la carpeta `App`.
2. Haz doble clic en `Abrir-App.bat`.
3. Se abriran dos ventanas negras: **Backend** y **Frontend**. No las cierres.
4. Espera unos segundos. El navegador abrira automaticamente:
   http://localhost:5173
5. Si el navegador no se abre, escribelo manualmente en la barra de direcciones.

La ventana del lanzador se cierra sola. Las dos ventanas que deben quedar abiertas son
**Backend** y **Frontend**.

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

La base de datos se crea automaticamente en `backend\data\embriagados.db` la primera vez
que se inicia el backend.

## Estructura

- `backend\`: API REST con Express, puerto **3001**.
- `frontend\`: interfaz con React + Vite, puerto **5173**.
- `Abrir-App.bat`: inicia ambos servidores y abre el navegador.
