// Tests automatizados de la API. Se usa una base de datos en memoria.
// Import dinamico para que DB_PATH se asigne ANTES de cargar el modulo app.js.
process.env.DB_PATH = ':memory:';

import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../app.js');

before(async () => {});

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

test('Ruta inexistente responde 404', async () => {
  const res = await request(app).get('/api/no-existe');
  assert.equal(res.status, 404);
});