# Casos de prueba — EMBRIAGADOS CRUD

Documento para la evidencia del proyecto. Ejecuta cada caso, anota el resultado en la
columna **Resultado** y captura la pantalla/video en la seccion de **Evidencia** de Drive.

Leyenda: `OK` = se comporta como se espera · `FALLO` = no coincide con lo esperado.

## 1. General

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| G1 | Estado de la API  | Abrir `GET /api/health`        | JSON `{"ok": true, "mensaje": "API Embriagados funcionando"}` | ok |
| G2 | Navegacion        | Ir a `http://localhost:5173`   | Se ve el panel con menu: Productos, Categorias, Ingredientes, Clientes, Ventas | ok |
| G3 | Ruta inexistente  | Pedir `GET /api/xyz`           | Respuesta 404 con JSON `{ error: ... }`     | ok |

## 2. Productos (C)RU(D)

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| P1 | Listar            | Abrir pagina Productos         | Se muestran los productos del seed (Granizado Maracuya, etc.) | ok |
| P2 | Crear             | "Nuevo producto": Maracumango, precio 9000, stock 12 | Aparece en la tabla | ok |
| P3 | Validar crear     | Crear sin nombre               | Error "El nombre es obligatorio", no se crea | ok |
| P4 | Validar precio    | Crear con precio negativo      | Error "El precio debe ser un numero mayor o igual a 0" | ok |
| P5 | Leer detalle      | `GET /api/products/:id` del creado | JSON con el producto y su categoria | ok |
| P6 | Editar            | Cambiar precio a 9500          | La tabla refleja el nuevo precio            | ok |
| P7 | Eliminar          | Eliminar el producto creado    | Desaparece de la tabla; `GET /:id` → 404    | ok |
| P8 | Buscar            | Escribir "Maracu" en el buscador | Solo aparecen productos que contengan "Maracu" | ok |

## 3. Categorias CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| C1 | Listar            | Abrir pagina Categorias        | Se ven Granizados y Complementos            | ok |
| C2 | Crear             | Nueva: "Postres"               | Aparece en la tabla                         | ok |
| C3 | Editar            | Renombrar "Postres" → "Postres Frios" | Se actualiza en la tabla            | ok |
| C4 | Eliminar          | Eliminar la categoria          | Desaparece; sus productos quedan sin categoria (FK `ON DELETE SET NULL`) | ok |
| C5 | Validar           | Crear sin nombre               | Error "El nombre es obligatorio"            | ok |

## 4. Ingredientes CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| I1 | Listar            | Abrir pagina Ingredientes      | Se ven los insumos del seed con unidad y stock | ok |
| I2 | Crear             | Nuevo: "Canela", unidad g, stock 500 | Aparece en la tabla                 | ok |
| I3 | Editar            | Cambiar unidad a "kg"          | Se actualiza en la tabla                   | ok |
| I4 | Eliminar          | Eliminar "Canela"              | Desaparece de la tabla                     | ok |
| I5 | Validar           | Crear con stock negativo       | El frontend permite solo valores >= 0      | ok |

## 5. Clientes CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| K1 | Listar            | Abrir pagina Clientes          | Se ven Carlos Perez y Maria Gomez (seed)    | ok |
| K2 | Crear             | Nuevo: "Ana Torres", tel 3009998877 | Aparece en la tabla                  | ok |
| K3 | Editar            | Cambiarle el telefono          | Se actualiza en la tabla                   | ok |
| K4 | Eliminar          | Eliminar "Ana Torres"          | Desaparece de la tabla                     | ok |
| K5 | Buscar            | Buscar por telefono "311"      | Aparecen los clientes con ese telefono      | ok |

## 6. Ventas CRUD

| #  | Funcionalidad     | Accion                         | Resultado esperado                          | Resultado |
| -- | ----------------- | ------------------------------ | ------------------------------------------- | --------- |
| V1 | Listar            | Abrir pagina Ventas            | Si hay ventas, se muestran con producto + total; si no, mensaje "Aun no hay ventas" | ok |
| V2 | Crear             | Producto Granizado Maracuya (8000), cantidad 2 | Se registra con total **16000** (8000×2) | ok |
| V3 | Total calculado   | Ver la fila creada y el acumulado | total = precio × cantidad, sumado arriba  | ok |
| V4 | Validar cantidad  | Registrar con cantidad 0       | Error "La cantidad debe ser un entero mayor o igual a 1" | ok |
| V5 | Validar producto  | Registrar sin seleccionar producto | Error "Debes indicar el producto"      | ok |
| V6 | Eliminar          | Eliminar la venta creada       | Desaparece y el acumulado baja            | ok |
| V7 | Confirmacion      | Registrar una venta valida     | Aparece el mensaje "Confirmar venta" con producto, cantidad y total; al aceptar se guarda, al cancelar no | ok |
| V8 | Stock insuficiente| Registrar 21 uds de un producto con stock 20 | Error "Stock insuficiente: solo hay 20 unidades de ..." | ok |

