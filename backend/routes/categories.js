import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Listar todas las categorias
router.get('/', (_req, res) => {
  res.json(getDb().prepare('SELECT * FROM Category ORDER BY name').all());
});

// Obtener una categoria por id
router.get('/:id', (req, res) => {
  const row = getDb().prepare('SELECT * FROM Category WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json(row);
});

// Crear una categoria
router.post('/', (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  const info = getDb().prepare('INSERT INTO Category (name) VALUES (?)').run(name.trim());
  const created = getDb().prepare('SELECT * FROM Category WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Editar una categoria
router.put('/:id', (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  const db = getDb();
  const info = db.prepare('UPDATE Category SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json(db.prepare('SELECT * FROM Category WHERE id = ?').get(req.params.id));
});

// Eliminar una categoria (los productos quedan sin categoria por la FK)
router.delete('/:id', (req, res) => {
  const info = getDb().prepare('DELETE FROM Category WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json({ deleted: true, id: Number(req.params.id) });
});

export default router;