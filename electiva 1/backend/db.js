import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'embriagados.db');

if (dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const digest = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${digest}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, digest] = stored.split(':');
  const candidate = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  const a = Buffer.from(digest, 'hex');
  const b = Buffer.from(candidate, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      categoryId INTEGER,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS Ingredient (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'unidad',
      stock REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ProductIngredient (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      ingredientId INTEGER NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredientId) REFERENCES Ingredient(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Customer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cajero',
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Sale (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      userId INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      total REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (customerId) REFERENCES Customer(id),
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS SaleItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saleId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unitPrice REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (saleId) REFERENCES Sale(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );
  `);

  migrateSaleSchemaIfNeeded();
  migrateRecipeSchemaIfNeeded();
}

function migrateSaleSchemaIfNeeded() {
  const saleColumns = db.prepare('PRAGMA table_info(Sale)').all();
  const names = new Set(saleColumns.map((c) => c.name));
  const hasLegacyShape = names.has('productId') && names.has('unitPrice') && !names.has('customerId');
  if (hasLegacyShape) {
    db.exec(`
      BEGIN;
      CREATE TABLE Sale_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER,
        userId INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
        total REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (customerId) REFERENCES Customer(id),
        FOREIGN KEY (userId) REFERENCES User(id)
      );
      INSERT INTO Sale_new (id, customerId, userId, createdAt, total)
        SELECT id, NULL, userId, createdAt, total FROM Sale;
      CREATE TABLE IF NOT EXISTS SaleItem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saleId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unitPrice REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (saleId) REFERENCES Sale(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES Product(id)
      );
      INSERT INTO SaleItem (saleId, productId, quantity, unitPrice, subtotal)
        SELECT id, productId, quantity, unitPrice, total FROM Sale
        WHERE productId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SaleItem si WHERE si.saleId = Sale.id);
      DROP TABLE Sale;
      ALTER TABLE Sale_new RENAME TO Sale;
      COMMIT;
    `);
    return;
  }
  if (!names.has('userId')) {
    db.exec('ALTER TABLE Sale ADD COLUMN userId INTEGER REFERENCES User(id)');
  }
  if (!names.has('customerId')) {
    db.exec('ALTER TABLE Sale ADD COLUMN customerId INTEGER REFERENCES Customer(id)');
  }
}

function migrateRecipeSchemaIfNeeded() {
  const duplicates = db
    .prepare(
      `SELECT productId, ingredientId
       FROM ProductIngredient
       GROUP BY productId, ingredientId
       HAVING COUNT(*) > 1`
    )
    .all();

  if (duplicates.length > 0) {
    db.transaction(() => {
      const removeDuplicate = db.prepare(
        `DELETE FROM ProductIngredient
         WHERE productId = ? AND ingredientId = ?
           AND id NOT IN (
             SELECT MIN(id) FROM ProductIngredient WHERE productId = ? AND ingredientId = ?
           )`
      );
      for (const row of duplicates) {
        removeDuplicate.run(row.productId, row.ingredientId, row.productId, row.ingredientId);
      }
    })();
  }

  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_product_ingredient_pair ON ProductIngredient(productId, ingredientId)');
}

export function seedIfEmpty() {
  const hasData = db.prepare('SELECT COUNT(*) AS n FROM Category').get().n > 0;
  if (hasData) {
    seedUsersIfEmpty();
    return;
  }

  const insertCategory = db.prepare('INSERT INTO Category (name) VALUES (?)');
  const insertProduct = db.prepare('INSERT INTO Product (name, categoryId, price, stock) VALUES (?, ?, ?, ?)');
  const insertIngredient = db.prepare('INSERT INTO Ingredient (name, unit, stock) VALUES (?, ?, ?)');
  const insertCustomer = db.prepare('INSERT INTO Customer (name, phone) VALUES (?, ?)');
  const insertRecipe = db.prepare('INSERT INTO ProductIngredient (productId, ingredientId, quantity) VALUES (?, ?, ?)');

  db.transaction(() => {
    const granizados = insertCategory.run('Granizados').lastInsertRowid;
    const complementos = insertCategory.run('Complementos').lastInsertRowid;

    const p1 = insertProduct.run('Granizado Maracuya', granizados, 8000, 20).lastInsertRowid;
    const p2 = insertProduct.run('Granizado Azul', granizados, 8000, 15).lastInsertRowid;
    const p3 = insertProduct.run('Granizado Mora', granizados, 8500, 12).lastInsertRowid;
    insertProduct.run('Gomitas', complementos, 3000, 30);
    insertProduct.run('Chamoy', complementos, 2500, 25);

    const i1 = insertIngredient.run('Jarabe de Maracuya', 'ml', 5000).lastInsertRowid;
    const i2 = insertIngredient.run('Hielo triturado', 'g', 10000).lastInsertRowid;
    const i3 = insertIngredient.run('Leche condensada', 'g', 3000).lastInsertRowid;

    insertRecipe.run(p1, i1, 100);
    insertRecipe.run(p1, i2, 150);
    insertRecipe.run(p1, i3, 30);
    insertRecipe.run(p2, i2, 150);
    insertRecipe.run(p2, i3, 30);
    insertRecipe.run(p3, i1, 80);
    insertRecipe.run(p3, i2, 150);
    insertRecipe.run(p3, i3, 30);

    insertCustomer.run('Carlos Perez', '3001234567');
    insertCustomer.run('Maria Gomez', '3117654321');
  })();

  seedUsersIfEmpty();
}

function seedUsersIfEmpty() {
  const hasUsers = db.prepare('SELECT COUNT(*) AS n FROM User').get().n > 0;
  if (hasUsers) return;

  const username = String(process.env.SEED_ADMIN_USERNAME || 'admin').trim();
  const password = String(
    process.env.SEED_ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123')
  );
  const name = String(process.env.SEED_ADMIN_NAME || 'Administrador').trim();

  if (!username || !password) {
    throw new Error('Configura SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD para inicializar el usuario admin');
  }

  db.prepare('INSERT INTO User (username, password, name, role, active) VALUES (?, ?, ?, ?, 1)').run(
    username,
    hashPassword(password),
    name,
    'admin'
  );
}

export function getDb() {
  return db;
}

export function transaction(fn) {
  return db.transaction(fn)();
}

export function createPasswordHash(password) {
  return hashPassword(password);
}
