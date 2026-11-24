import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB_PATH permite usar una base temporal en memoria (para los tests).
export const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'embriagados.db');

if (dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Crea las tablas si no existen.
 * Modelo acorde al diagrama: Sale con detalles SaleItem, receta ProductIngredient.
 */
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

    CREATE TABLE IF NOT EXISTS Sale (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      total REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (customerId) REFERENCES Customer(id)
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
}

/**
 * Inserta datos de ejemplo solo si la tabla Category esta vacia.
 */
export function seedIfEmpty() {
  const hasData = db.prepare('SELECT COUNT(*) AS n FROM Category').get().n > 0;
  if (hasData) return;

  const insertCategory = db.prepare('INSERT INTO Category (name) VALUES (?)');
  const insertProduct = db.prepare(
    'INSERT INTO Product (name, categoryId, price, stock) VALUES (?, ?, ?, ?)'
  );
  const insertIngredient = db.prepare(
    'INSERT INTO Ingredient (name, unit, stock) VALUES (?, ?, ?)'
  );
  const insertCustomer = db.prepare('INSERT INTO Customer (name, phone) VALUES (?, ?)');
  const insertRecipe = db.prepare(
    'INSERT INTO ProductIngredient (productId, ingredientId, quantity) VALUES (?, ?, ?)'
  );

  const cats = db.transaction(() => {
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

    // Recetas básicas
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

    return { granizados, complementos };
  })();

  console.log(`Seed aplicado. Categorias creadas: ${cats.granizados}, ${cats.complementos}`);
}

export function getDb() {
  return db;
}

/**
 * Ejecuta una funcion dentro de una transaccion de SQLite.
 * Si la funcion lanza un error, todos los cambios se revierten.
 */
export function transaction(fn) {
  return db.transaction(fn)();
}
