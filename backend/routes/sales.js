import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

const listSql = `
  SELECT s.id, s.productId, s.quantity, s.unitPrice, s.total, s.createdAt,
         p.name AS productName
  FROM Sale s
  JOIN Product p ON p.id = s.productId
`;

// Listar ventas
router.get('/', (_req, res) => {
  res.json(getDb().prepare(`${listSql} ORDER BY s.id DESC`).all());
});

// Obtener una venta por id
router.get('/:id', (req, res) => {
  const row = getDb().prepare(`${listSql} WHERE s.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(row);
});

// Crear una venta (toma el precio del producto y calcula el total)
router.post('/', (req, res) => {
  const { productId, quantity } = req.body ?? {};
  const db = getDb();

  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ error: 'Debes indicar el producto' });
  }
  if (quantity == null || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser un entero mayor o igual a 1' });
  }

  const product = db.prepare('SELECT id, name, price FROM Product WHERE id = ?').get(Number(productId));
  if (!product) return res.status(400).json({ error: 'El producto no existe' });

  const qty = Number(quantity);
  const unitPrice = Number(product.price);
  const total = qty * unitPrice;

  const info = db
    .prepare('INSERT INTO Sale (productId, quantity, unitPrice, total) VALUES (?, ?, ?, ?)')
    .run(product.id, qty, unitPrice, total);

  const created = db.prepare(`${listSql} WHERE s.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Eliminar una venta
router.delete('/:id', (req, res) => {
  const info = getDb().prepare('DELETE FROM Sale WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json({ deleted: true, id: Number(req.params.id) });
});

export default router;