import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

const listSql = `
  SELECT p.id, p.name, p.price, p.stock, p.categoryId, c.name AS categoryName
  FROM Product p
  LEFT JOIN Category c ON c.id = p.categoryId
`;

// Listar productos (con el nombre de su categoria)
router.get('/', (req, res) => {
  const { search } = req.query;
  if (search) {
    const rows = getDb()
      .prepare(`${listSql} WHERE p.name LIKE ? ORDER BY p.name`)
      .all(`%${search}%`);
    return res.json(rows);
  }
  res.json(getDb().prepare(`${listSql} ORDER BY p.name`).all());
});

// Obtener un producto por id
router.get('/:id', (req, res) => {
  const row = getDb().prepare(`${listSql} WHERE p.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(row);
});

// Crear un producto
router.post('/', (req, res) => {
  const { name, categoryId, price, stock } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'El precio debe ser un numero mayor o igual a 0' });
  }
  const info = getDb()
    .prepare('INSERT INTO Product (name, categoryId, price, stock) VALUES (?, ?, ?, ?)')
    .run(name.trim(), categoryId || null, Number(price), Number(stock ?? 0));
  const created = getDb().prepare(`${listSql} WHERE p.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Editar un producto
router.put('/:id', (req, res) => {
  const { name, categoryId, price, stock } = req.body ?? {};
  const db = getDb();
  const existing = db.prepare('SELECT id FROM Product WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'El precio debe ser un numero mayor o igual a 0' });
  }

  db.prepare('UPDATE Product SET name = ?, categoryId = ?, price = ?, stock = ? WHERE id = ?').run(
    name.trim(),
    categoryId || null,
    Number(price),
    Number(stock ?? 0),
    req.params.id
  );
  res.json(db.prepare(`${listSql} WHERE p.id = ?`).get(req.params.id));
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const info = getDb().prepare('DELETE FROM Product WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ deleted: true, id: Number(req.params.id) });
});

export default router;