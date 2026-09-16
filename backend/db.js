import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB_PATH permite usar una base temporal en memoria (para los tests).
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'embriagados.db');

if (dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Crea las tablas si no existen.
 * Producto.A categoriaId apunta a Category (FK). Sale.productId apunta a Product (FK).
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

    CREATE TABLE IF NOT EXISTS Customer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS Sale (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
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

  const cats = db.transaction(() => {
    const granizados = insertCategory.run('Granizados').lastInsertRowid;
    const complementos = insertCategory.run('Complementos').lastInsertRowid;

    insertProduct.run('Granizado Maracuya', granizados, 8000, 20);
    insertProduct.run('Granizado Azul', granizados, 8000, 15);
    insertProduct.run('Granizado Mora', granizados, 8500, 12);
    insertProduct.run('Gomitas', complementos, 3000, 30);
    insertProduct.run('Chamoy', complementos, 2500, 25);

    insertIngredient.run('Jarabe de Maracuya', 'ml', 5000);
    insertIngredient.run('Hielo triturado', 'g', 10000);
    insertIngredient.run('Leche condensada', 'g', 3000);

    insertCustomer.run('Carlos Perez', '3001234567');
    insertCustomer.run('Maria Gomez', '3117654321');

    return { granizados, complementos };
  })();

  console.log(`Seed aplicado. Categorias creadas: ${cats.granizados}, ${cats.complementos}`);
}

export function getDb() {
  return db;
}

export { dbPath };