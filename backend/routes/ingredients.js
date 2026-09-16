import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Listar ingredientes
router.get('/', (_req, res) => {
  res.json(getDb().prepare('SELECT * FROM Ingredient ORDER BY name').all());
});

// Obtener un ingrediente por id
router.get('/:id', (req, res) => {
  const row = getDb().prepare('SELECT * FROM Ingredient WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Ingrediente no encontrado' });
  res.json(row);
});

// Crear un ingrediente
router.post('/', (req, res) => {
  const { name, unit, stock } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  const info = getDb()
    .prepare('INSERT INTO Ingredient (name, unit, stock) VALUES (?, ?, ?)')
    .run(name.trim(), unit || 'unidad', Number(stock ?? 0));
  const created = getDb().prepare('SELECT * FROM Ingredient WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Editar un ingrediente
router.put('/:id', (req, res) => {
  const { name, unit, stock } = req.body ?? {};
  const db = getDb();
  const existing = db.prepare('SELECT id FROM Ingredient WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Ingrediente no encontrado' });

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  db.prepare('UPDATE Ingredient SET name = ?, unit = ?, stock = ? WHERE id = ?').run(
    name.trim(),
    unit || 'unidad',
    Number(stock ?? 0),
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM Ingredient WHERE id = ?').get(req.params.id));
});

// Eliminar un ingrediente
router.delete('/:id', (req, res) => {
  const info = getDb().prepare('DELETE FROM Ingredient WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
  res.json({ deleted: true, id: Number(req.params.id) });
});

export default router;