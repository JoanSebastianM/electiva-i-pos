# Casos de prueba — EMBRIAGADOS CRUD

Documento para la evidencia del proyecto. Ejecuta cada caso, anota el resultado en la
columna **Resultado** y captura la pantalla/video en la seccion de **Evidencia** de Drive.

Leyenda: `OK` = se comporta como se espera · `FALLO` = no coincide con lo esperado.

## 1. General

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| G1 | Estado de la API  | Abrir `GET /api/health`        | JSON `{"ok": true, "mensaje": "API Embriagados funcionando"}` | Pendiente |
| G2 | Navegacion        | Ir a `http://localhost:5173`   | Se ve el panel con menu: Productos, Categorias, Ingredientes, Clientes, Ventas | Pendiente |
| G3 | Ruta inexistente  | Pedir `GET /api/xyz`           | Respuesta 404 con JSON `{ error: ... }`     | Pendiente |

## 2. Productos (C)RU(D)

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| P1 | Listar            | Abrir pagina Productos         | Se muestran los productos del seed (Granizado Maracuya, etc.) | Pendiente |
| P2 | Crear             | "Nuevo producto": Maracumango, precio 9000, stock 12 | Aparece en la tabla | Pendiente |
| P3 | Validar crear     | Crear sin nombre               | Error "El nombre es obligatorio", no se crea | Pendiente |
| P4 | Validar precio    | Crear con precio negativo      | Error "El precio debe ser un numero mayor o igual a 0" | Pendiente |
| P5 | Leer detalle      | `GET /api/products/:id` del creado | JSON con el producto y su categoria | Pendiente |
| P6 | Editar            | Cambiar precio a 9500          | La tabla refleja el nuevo precio            | Pendiente |
| P7 | Eliminar          | Eliminar el producto creado    | Desaparece de la tabla; `GET /:id` → 404    | Pendiente |
| P8 | Buscar            | Escribir "Maracu" en el buscador | Solo aparecen productos que contengan "Maracu" | Pendiente |

## 3. Categorias CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| C1 | Listar            | Abrir pagina Categorias        | Se ven Granizados y Complementos            | Pendiente |
| C2 | Crear             | Nueva: "Postres"               | Aparece en la tabla                         | Pendiente |
| C3 | Editar            | Renombrar "Postres" → "Postres Frios" | Se actualiza en la tabla            | Pendiente |
| C4 | Eliminar          | Eliminar la categoria          | Desaparece; sus productos quedan sin categoria (FK `ON DELETE SET NULL`) | Pendiente |
| C5 | Validar           | Crear sin nombre               | Error "El nombre es obligatorio"            | Pendiente |

## 4. Ingredientes CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| I1 | Listar            | Abrir pagina Ingredientes      | Se ven los insumos del seed con unidad y stock | Pendiente |
| I2 | Crear             | Nuevo: "Canela", unidad g, stock 500 | Aparece en la tabla                 | Pendiente |
| I3 | Editar            | Cambiar unidad a "kg"          | Se actualiza en la tabla                   | Pendiente |
| I4 | Eliminar          | Eliminar "Canela"              | Desaparece de la tabla                     | Pendiente |
| I5 | Validar           | Crear con stock negativo       | El frontend permite solo valores >= 0      | Pendiente |

## 5. Clientes CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| K1 | Listar            | Abrir pagina Clientes          | Se ven Carlos Perez y Maria Gomez (seed)    | Pendiente |
| K2 | Crear             | Nuevo: "Ana Torres", tel 3009998877 | Aparece en la tabla                  | Pendiente |
| K3 | Editar            | Cambiarle el telefono          | Se actualiza en la tabla                   | Pendiente |
| K4 | Eliminar          | Eliminar "Ana Torres"          | Desaparece de la tabla                     | Pendiente |
| K5 | Buscar            | Buscar por telefono "311"      | Aparecen los clientes con ese telefono      | Pendiente |

## 6. Ventas CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| V1 | Listar            | Abrir pagina Ventas            | Si hay ventas, se muestran con producto + total; si no, mensaje "Aun no hay ventas" | Pendiente |
| V2 | Crear             | Producto Granizado Maracuya (8000), cantidad 2 | Se registra con total **16000** (8000×2) | Pendiente |
| V3 | Total calculado   | Ver la fila creada y el acumulado | total = precio × cantidad, sumado arriba  | Pendiente |
| V4 | Validar cantidad  | Registrar con cantidad 0       | Error "La cantidad debe ser un entero mayor o igual a 1" | Pendiente |
| V5 | Validar producto  | Registrar sin seleccionar producto | Error "Debes indicar el producto"      | Pendiente |
| V6 | Eliminar          | Eliminar la venta creada       | Desaparece y el acumulado baja            | Pendiente |
| V7 | Confirmacion      | Registrar una venta valida     | Aparece el mensaje "Confirmar venta" con producto, cantidad y total; al aceptar se guarda, al cancelar no | Pendiente |
| V8 | Stock insuficiente| Registrar 21 uds de un producto con stock 20 | Error "Stock insuficiente: solo hay 20 unidades de ..." | Pendiente |

> Pendiente: cuando Nicolas termine su rama, agregar el caso **P9 Ordenar** en la tabla de Productos
> (selector "Precio (menor)" / "Precio (mayor)").

## Evidencia (para Google Drive)

1. **Video 1 — CRUD basico (2-3 min):** entrar, listar, crear/editar/eliminar en Productos y Categorias.
2. **Video 2 — Resto de modulos (2-3 min):** Ingredientes, Clientes y Ventas (mostrar que el total se calcula).
3. **Capturas:** `npm test` pasando (10/10), una del navegador con cada modulo, y una del repositorio en GitHub con las ramas.
4. Nombrar los archivos como `EVIDENCIA_1_nombre_integrante.jpg` etc., y subir a la carpeta compartida.