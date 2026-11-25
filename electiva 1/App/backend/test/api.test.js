// Tests automatizados de la API. Se usa una base de datos en memoria.
// Import dinamico para que DB_PATH se asigne ANTES de cargar el modulo app.js.
process.env.DB_PATH = ':memory:';

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../app.js');

test('GET /api/health responde ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('Productos: seed + CRUD completo', async () => {
  // seed ya cargo productos; verificamos que lista no esta vacia
  const list = await request(app).get('/api/products');
  assert.equal(list.status, 200);
  assert.ok(list.body.length >= 3);

  // crear
  const created = await request(app).post('/api/products').send({ name: 'Granizado Limon', price: 8500, stock: 10 });
  assert.equal(created.status, 201);
  assert.equal(created.body.name, 'Granizado Limon');
  const id = created.body.id;

  // leer por id
  const one = await request(app).get(`/api/products/${id}`);
  assert.equal(one.status, 200);
  assert.equal(one.body.price, 8500);

  // editar
  const updated = await request(app).put(`/api/products/${id}`).send({ name: 'Granizado Limon Grande', categoryId: null, price: 9500, stock: 8 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.price, 9500);

  // borrar
  const removed = await request(app).delete(`/api/products/${id}`);
  assert.equal(removed.status, 200);
  assert.equal(removed.body.deleted, true);

  // ya no existe
  const gone = await request(app).get(`/api/products/${id}`);
  assert.equal(gone.status, 404);
});

test('Productos: validacion de nombre obligatorio', async () => {
  const res = await request(app).post('/api/products').send({ price: 5000 });
  assert.equal(res.status, 400);
});

test('Categorias: CRUD completo', async () => {
  const created = await request(app).post('/api/categories').send({ name: 'Postres' });
  assert.equal(created.status, 201);
  const id = created.body.id;

  const one = await request(app).get(`/api/categories/${id}`);
  assert.equal(one.status, 200);

  const updated = await request(app).put(`/api/categories/${id}`).send({ name: 'Postres Frios' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, 'Postres Frios');

  const removed = await request(app).delete(`/api/categories/${id}`);
  assert.equal(removed.status, 200);

  const gone = await request(app).get(`/api/categories/${id}`);
  assert.equal(gone.status, 404);
});

test('Ingredientes: CRUD completo', async () => {
  const created = await request(app).post('/api/ingredients').send({ name: 'Canela', unit: 'g', stock: 500 });
  assert.equal(created.status, 201);
  const id = created.body.id;

  await request(app).put(`/api/ingredients/${id}`).send({ name: 'Canela en polvo', unit: 'g', stock: 600 }).expect(200);

  const removed = await request(app).delete(`/api/ingredients/${id}`);
  assert.equal(removed.status, 200);

  const gone = await request(app).get(`/api/ingredients/${id}`);
  assert.equal(gone.status, 404);
});

test('Clientes: CRUD completo', async () => {
  const created = await request(app).post('/api/customers').send({ name: 'Ana Torres', phone: '3009998877' });
  assert.equal(created.status, 201);
  const id = created.body.id;

  await request(app).put(`/api/customers/${id}`).send({ name: 'Ana Torres M', phone: '3009998877' }).expect(200);

  const removed = await request(app).delete(`/api/customers/${id}`);
  assert.equal(removed.status, 200);
});

test('Ventas: crear usa el precio del producto y calcula el total', async () => {
  const products = await request(app).get('/api/products').then((r) => r.body);
  const product = products[0];
  const qty = 3;

  const created = await request(app).post('/api/sales').send({ productId: product.id, quantity: qty });
  assert.equal(created.status, 201);
  assert.equal(created.body.total, product.price * qty);
  assert.equal(created.body.productName, product.name);

  const list = await request(app).get('/api/sales');
  assert.equal(list.status, 200);
  assert.ok(list.body.length >= 1);

  await request(app).delete(`/api/sales/${created.body.id}`).expect(200);
});

test('Ventas: validacion de cantidad', async () => {
  const products = await request(app).get('/api/products').then((r) => r.body);
  const res = await request(app).post('/api/sales').send({ productId: products[0].id, quantity: 0 });
  assert.equal(res.status, 400);
});

test('Ventas: rechaza cantidad mayor al stock disponible', async () => {
  const products = await request(app).get('/api/products').then((r) => r.body);
  const product = products[0];
  const qty = product.stock + 1;

  const res = await request(app).post('/api/sales').send({ productId: product.id, quantity: qty });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Stock insuficiente/);

  const one = await request(app).post('/api/sales').send({ productId: product.id, quantity: product.stock });
  assert.equal(one.status, 201);
});

test('Ventas: descuenta el stock al registrar', async () => {
  const product = await request(app)
    .post('/api/products')
    .send({ name: 'Producto stock venta', price: 1000, stock: 10 })
    .then((r) => r.body);

  const sale = await request(app)
    .post('/api/sales')
    .send({ productId: product.id, quantity: 3 });
  assert.equal(sale.status, 201);

  const updated = await request(app).get(`/api/products/${product.id}`);
  assert.equal(updated.body.stock, 7);

  await request(app).delete(`/api/sales/${sale.body.id}`).expect(200);
  await request(app).delete(`/api/products/${product.id}`).expect(200);
});

test('Ventas: restaura el stock al eliminar la venta', async () => {
  const product = await request(app)
    .post('/api/products')
    .send({ name: 'Producto stock restaurado', price: 1500, stock: 5 })
    .then((r) => r.body);

  const sale = await request(app)
    .post('/api/sales')
    .send({ productId: product.id, quantity: 2 });
  assert.equal(sale.status, 201);

  const afterSale = await request(app).get(`/api/products/${product.id}`);
  assert.equal(afterSale.body.stock, 3);

  await request(app).delete(`/api/sales/${sale.body.id}`).expect(200);

  const afterDelete = await request(app).get(`/api/products/${product.id}`);
  assert.equal(afterDelete.body.stock, 5);

  await request(app).delete(`/api/products/${product.id}`).expect(200);
});

test('Ventas: una venta invalida no modifica el stock', async () => {
  const product = await request(app)
    .post('/api/products')
    .send({ name: 'Producto stock intacto', price: 2000, stock: 4 })
    .then((r) => r.body);

  const res = await request(app)
    .post('/api/sales')
    .send({ productId: product.id, quantity: 5 });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /Stock insuficiente/);

  const after = await request(app).get(`/api/products/${product.id}`);
  assert.equal(after.body.stock, 4);

  await request(app).delete(`/api/products/${product.id}`).expect(200);
});

test('Ventas: vender todo el stock deja el producto en cero', async () => {
  const product = await request(app)
    .post('/api/products')
    .send({ name: 'Producto stock exacto', price: 3000, stock: 2 })
    .then((r) => r.body);

  const sale = await request(app)
    .post('/api/sales')
    .send({ productId: product.id, quantity: 2 });
  assert.equal(sale.status, 201);

  const afterSale = await request(app).get(`/api/products/${product.id}`);
  assert.equal(afterSale.body.stock, 0);

  const rejected = await request(app)
    .post('/api/sales')
    .send({ productId: product.id, quantity: 1 });
  assert.equal(rejected.status, 400);
  assert.match(rejected.body.error, /Stock insuficiente/);

  await request(app).delete(`/api/sales/${sale.body.id}`).expect(200);
  await request(app).delete(`/api/products/${product.id}`).expect(200);
});

test('Ventas: descuenta y restaura los ingredientes de la receta', async () => {
  const products = await request(app).get('/api/products').then((r) => r.body);
  const product = products.find((p) => p.name === 'Granizado Maracuya');
  assert.ok(product, 'El seed debe incluir Granizado Maracuya');

  const recipe = [
    { name: 'Jarabe de Maracuya', quantity: 100 },
    { name: 'Hielo triturado', quantity: 150 },
    { name: 'Leche condensada', quantity: 30 }
  ];
  const ingredients = await request(app).get('/api/ingredients').then((r) => r.body);
  const before = recipe.map((item) => ingredients.find((i) => i.name === item.name));
  assert.ok(before.every(Boolean), 'El seed debe incluir los ingredientes de la receta');

  const quantity = 2;
  const sale = await request(app).post('/api/sales').send({ productId: product.id, quantity });
  assert.equal(sale.status, 201);

  const afterSale = await request(app).get('/api/ingredients').then((r) => r.body);
  recipe.forEach((item, index) => {
    const current = afterSale.find((i) => i.name === item.name);
    assert.equal(current.stock, before[index].stock - item.quantity * quantity);
  });

  await request(app).delete(`/api/sales/${sale.body.id}`).expect(200);

  const afterDelete = await request(app).get('/api/ingredients').then((r) => r.body);
  recipe.forEach((item, index) => {
    const current = afterDelete.find((i) => i.name === item.name);
    assert.equal(current.stock, before[index].stock);
  });
});

test('Ventas: rechaza la venta si no hay stock de un ingrediente', async () => {
  const products = await request(app).get('/api/products').then((r) => r.body);
  const product = products.find((p) => p.name === 'Granizado Maracuya');
  const ingredients = await request(app).get('/api/ingredients').then((r) => r.body);
  const jarabe = ingredients.find((i) => i.name === 'Jarabe de Maracuya');
  assert.ok(product && jarabe, 'El seed debe incluir el producto y su ingrediente');

  const productBefore = await request(app).get(`/api/products/${product.id}`).then((r) => r.body);

  await request(app)
    .put(`/api/ingredients/${jarabe.id}`)
    .send({ name: jarabe.name, unit: jarabe.unit, stock: 0 })
    .expect(200);

  const res = await request(app).post('/api/sales').send({ productId: product.id, quantity: 1 });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Stock insuficiente del ingrediente/);

  const productAfter = await request(app).get(`/api/products/${product.id}`).then((r) => r.body);
  assert.equal(productAfter.stock, productBefore.stock);

  await request(app)
    .put(`/api/ingredients/${jarabe.id}`)
    .send({ name: jarabe.name, unit: jarabe.unit, stock: jarabe.stock })
    .expect(200);
});

test('Ventas: producto inexistente responde 404', async () => {
  const res = await request(app).post('/api/sales').send({ productId: 999999, quantity: 1 });
  assert.equal(res.status, 404);
  assert.match(res.body.error, /Producto no encontrado/);
});

test('Ventas: el listado agrupa los items de cada venta', async () => {
  const productA = await request(app)
    .post('/api/products')
    .send({ name: 'Producto agrupado A', price: 1000, stock: 10 })
    .then((r) => r.body);
  const productB = await request(app)
    .post('/api/products')
    .send({ name: 'Producto agrupado B', price: 2000, stock: 10 })
    .then((r) => r.body);

  const saleA = await request(app)
    .post('/api/sales')
    .send({ productId: productA.id, quantity: 1 });
  const saleB = await request(app)
    .post('/api/sales')
    .send({ productId: productB.id, quantity: 2 });
  assert.equal(saleA.status, 201);
  assert.equal(saleB.status, 201);

  const list = await request(app).get('/api/sales');
  assert.equal(list.status, 200);

  const groupedA = list.body.find((sale) => sale.id === saleA.body.id);
  const groupedB = list.body.find((sale) => sale.id === saleB.body.id);

  assert.equal(groupedA.items.length, 1);
  assert.equal(groupedA.items[0].productName, 'Producto agrupado A');
  assert.equal(groupedA.items[0].quantity, 1);
  assert.equal(groupedA.productName, 'Producto agrupado A');

  assert.equal(groupedB.items.length, 1);
  assert.equal(groupedB.items[0].productName, 'Producto agrupado B');
  assert.equal(groupedB.items[0].quantity, 2);
  assert.equal(groupedB.productName, 'Producto agrupado B');

  await request(app).delete(`/api/sales/${saleA.body.id}`).expect(200);
  await request(app).delete(`/api/sales/${saleB.body.id}`).expect(200);
  await request(app).delete(`/api/products/${productA.id}`).expect(200);
  await request(app).delete(`/api/products/${productB.id}`).expect(200);
});

test('Ruta inexistente responde 404', async () => {
  const res = await request(app).get('/api/no-existe');
  assert.equal(res.status, 404);
});