process.env.DB_PATH = ':memory:';

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../app.js');

const CLIENT_HEADER = 'x-pos-client';
const CLIENT_VALUE = 'pos-granizados';

function api(agent, method, path) {
  return agent[method](path).set(CLIENT_HEADER, CLIENT_VALUE);
}

function unique(name) {
  return `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const admin = request.agent(app);
const adminLogin = await api(admin, 'post', '/api/auth/login').send({ username: 'admin', password: 'admin123' });
if (adminLogin.status !== 200) throw new Error(`No se pudo autenticar admin: ${adminLogin.text}`);

async function createProduct(overrides = {}) {
  const res = await api(admin, 'post', '/api/products').send({
    name: unique('Producto'),
    price: 1000,
    stock: 20,
    ...overrides
  });
  assert.equal(res.status, 201, res.text);
  return res.body;
}

async function createIngredient(overrides = {}) {
  const res = await api(admin, 'post', '/api/ingredients').send({
    name: unique('Ingrediente'),
    unit: 'g',
    stock: 1000,
    ...overrides
  });
  assert.equal(res.status, 201, res.text);
  return res.body;
}

test('GET /api/health responde ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('Auth: login valido, invalido y sin password', async () => {
  const agent = request.agent(app);
  const ok = await api(agent, 'post', '/api/auth/login').send({ username: 'admin', password: 'admin123' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.username, 'admin');
  assert.ok(!ok.body.user.password);

  const bad = await api(request.agent(app), 'post', '/api/auth/login').send({ username: 'admin', password: 'mal' });
  assert.equal(bad.status, 401);

  const me = await api(agent, 'get', '/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.username, 'admin');
});

test('Seguridad: rutas protegidas y header de cliente', async () => {
  const unauth = await request(app).get('/api/products');
  assert.equal(unauth.status, 401);

  const noHeader = await request(app).post('/api/products').send({ name: 'x', price: 1, stock: 1 });
  assert.equal(noHeader.status, 403);

  const noSession = await api(request.agent(app), 'post', '/api/products').send({ name: 'x', price: 1, stock: 1 });
  assert.equal(noSession.status, 401);
});

test('Auth: logout invalida la sesion', async () => {
  const agent = request.agent(app);
  await api(agent, 'post', '/api/auth/login').send({ username: 'admin', password: 'admin123' }).expect(200);
  await api(agent, 'post', '/api/auth/logout').expect(200);
  const after = await api(agent, 'get', '/api/products');
  assert.equal(after.status, 401);
});

test('Roles: cajero lee y crea ventas, pero no administra', async () => {
  const username = unique('caja');
  const created = await api(admin, 'post', '/api/users').send({
    username,
    password: '1234',
    name: 'Cajero Prueba',
    role: 'cajero'
  });
  assert.equal(created.status, 201, created.text);

  const cashier = request.agent(app);
  await api(cashier, 'post', '/api/auth/login').send({ username, password: '1234' }).expect(200);

  await api(cashier, 'get', '/api/products').expect(200);
  const product = await createProduct();
  const sale = await api(cashier, 'post', '/api/sales').send({ productId: product.id, quantity: 1 });
  assert.equal(sale.status, 201, sale.text);

  await api(cashier, 'post', '/api/products').send({ name: 'x', price: 1, stock: 1 }).expect(403);
  await api(cashier, 'get', '/api/users').expect(403);
  await api(cashier, 'put', `/api/inventory/${product.id}`).send({ stock: 1 }).expect(403);
  await api(cashier, 'delete', `/api/sales/${sale.body.id}`).expect(403);
  await api(cashier, 'put', `/api/products/${product.id}/recipes`).send({ items: [] }).expect(403);

  await api(admin, 'delete', `/api/users/${created.body.id}`).expect(200);
});

test('Users: CRUD, validacion de rol y sin exponer password', async () => {
  const created = await api(admin, 'post', '/api/users').send({
    username: unique('user'),
    password: '1234',
    name: 'Usuario Prueba',
    role: 'cajero'
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.password, undefined);

  const list = await api(admin, 'get', '/api/users');
  assert.ok(list.body.some((u) => u.id === created.body.id));
  assert.ok(list.body.every((u) => u.password === undefined));

  const updated = await api(admin, 'put', `/api/users/${created.body.id}`).send({
    username: created.body.username,
    name: 'Usuario Actualizado',
    role: 'cajero'
  });
  assert.equal(updated.status, 200, updated.text);
  assert.equal(updated.body.name, 'Usuario Actualizado');
  assert.equal(updated.body.role, 'cajero');

  const badRole = await api(admin, 'post', '/api/users').send({
    username: unique('badrole'),
    password: '1234',
    name: 'Rol Invalido',
    role: 'superadmin'
  });
  assert.equal(badRole.status, 400);

  await api(admin, 'delete', `/api/users/${created.body.id}`).expect(200);
});

test('Productos: CRUD completo', async () => {
  const created = await createProduct({ price: 8500, stock: 10 });
  await api(admin, 'get', `/api/products/${created.id}`).expect(200);
  const updated = await api(admin, 'put', `/api/products/${created.id}`).send({
    name: `${created.name} Grande`,
    categoryId: null,
    price: 9500,
    stock: 8
  });
  assert.equal(updated.status, 200);
  await api(admin, 'delete', `/api/products/${created.id}`).expect(200);
  await api(admin, 'get', `/api/products/${created.id}`).expect(404);
});

test('Productos: validacion', async () => {
  const res = await api(admin, 'post', '/api/products').send({ price: 5000 });
  assert.equal(res.status, 400);
});

test('Categorias: CRUD', async () => {
  const created = await api(admin, 'post', '/api/categories').send({ name: unique('Postres') });
  assert.equal(created.status, 201);
  await api(admin, 'put', `/api/categories/${created.body.id}`).send({ name: unique('Postres Frios') }).expect(200);
  await api(admin, 'delete', `/api/categories/${created.body.id}`).expect(200);
});

test('Ingredientes: CRUD', async () => {
  const created = await createIngredient({ unit: 'g', stock: 500 });
  await api(admin, 'put', `/api/ingredients/${created.id}`).send({ name: created.name, unit: 'g', stock: 600 }).expect(200);
  await api(admin, 'delete', `/api/ingredients/${created.id}`).expect(200);
});

test('Clientes: CRUD', async () => {
  const created = await api(admin, 'post', '/api/customers').send({ name: unique('Ana'), phone: '3009998877' });
  assert.equal(created.status, 201);
  await api(admin, 'put', `/api/customers/${created.body.id}`).send({ name: unique('Ana T'), phone: '3009998877' }).expect(200);
  await api(admin, 'delete', `/api/customers/${created.body.id}`).expect(200);
});

test('Inventario: lista y ajusta stock', async () => {
  const product = await createProduct({ stock: 10 });
  const updated = await api(admin, 'put', `/api/inventory/${product.id}`).send({ stock: 12 });
  assert.equal(updated.status, 200);
  assert.equal(Number(updated.body.stock), 12);
});

test('Recetas: crea, consulta y reemplaza', async () => {
  const product = await createProduct();
  const i1 = await createIngredient({ unit: 'ml', stock: 500 });
  const i2 = await createIngredient({ unit: 'g', stock: 500 });

  const created = await api(admin, 'put', `/api/products/${product.id}/recipes`).send({
    items: [
      { ingredientId: i1.id, quantity: 10 },
      { ingredientId: i2.id, quantity: 20 }
    ]
  });
  assert.equal(created.status, 200, created.text);
  assert.equal(created.body.length, 2);

  const listed = await api(admin, 'get', `/api/products/${product.id}/recipes`);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.length, 2);
  assert.equal(listed.body[0].ingredientName, i1.name);

  const replaced = await api(admin, 'put', `/api/products/${product.id}/recipes`).send({
    items: [{ ingredientId: i2.id, quantity: 30 }]
  });
  assert.equal(replaced.status, 200);
  assert.equal(replaced.body.length, 1);
  assert.equal(replaced.body[0].ingredientId, i2.id);
});

test('Ventas: descuenta y restaura producto e ingredientes', async () => {
  const product = await createProduct({ price: 1000, stock: 10 });
  const ingredient = await createIngredient({ unit: 'g', stock: 1000 });
  await api(admin, 'put', `/api/products/${product.id}/recipes`).send({
    items: [{ ingredientId: ingredient.id, quantity: 10 }]
  }).expect(200);

  const sale = await api(admin, 'post', '/api/sales').send({ productId: product.id, quantity: 2 });
  assert.equal(sale.status, 201, sale.text);
  assert.equal(sale.body.userId, adminLogin.body.user.id);

  const productAfter = await api(admin, 'get', `/api/products/${product.id}`);
  assert.equal(Number(productAfter.body.stock), 8);
  const ingredientAfter = await api(admin, 'get', `/api/ingredients/${ingredient.id}`);
  assert.equal(Number(ingredientAfter.body.stock), 980);

  await api(admin, 'delete', `/api/sales/${sale.body.id}`).expect(200);
  const productRestored = await api(admin, 'get', `/api/products/${product.id}`);
  assert.equal(Number(productRestored.body.stock), 10);
  const ingredientRestored = await api(admin, 'get', `/api/ingredients/${ingredient.id}`);
  assert.equal(Number(ingredientRestored.body.stock), 1000);
});

test('Ventas: rechaza stock insuficiente', async () => {
  const product = await createProduct({ stock: 1 });
  const res = await api(admin, 'post', '/api/sales').send({ productId: product.id, quantity: 2 });
  assert.equal(res.status, 400);
  const after = await api(admin, 'get', `/api/products/${product.id}`);
  assert.equal(Number(after.body.stock), 1);
});

test('Ventas: reversa transaccional ante error', async () => {
  const p1 = await createProduct({ stock: 5 });
  const p2 = await createProduct({ stock: 0 });
  const res = await api(admin, 'post', '/api/sales').send({
    items: [
      { productId: p1.id, quantity: 1 },
      { productId: p2.id, quantity: 1 }
    ]
  });
  assert.equal(res.status, 400);
  const p1After = await api(admin, 'get', `/api/products/${p1.id}`);
  assert.equal(Number(p1After.body.stock), 5);
});

test('CORS: permite origenes de los frontends y bloquea otros', async () => {
  const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-credentials'], 'true');

  const blocked = await request(app).get('/api/health').set('Origin', 'http://evil.example');
  assert.equal(blocked.headers['access-control-allow-origin'], undefined);
});
