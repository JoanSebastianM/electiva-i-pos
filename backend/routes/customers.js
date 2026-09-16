import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Listar clientes
router.get('/', (req, res) => {
  const { search } = req.query;
  if (search) {
    const rows = getDb()
      .prepare('SELECT * FROM Customer WHERE name LIKE ? OR phone LIKE ? ORDER BY name')
      .all(`%${search}%`, `%${search}%`);
    return res.json(rows);
  }
  res.json(getDb().prepare('SELECT * FROM Customer ORDER BY name').all());
});

// Obtener un cliente por id
router.get('/:id', (req, res) => {
  const row = getDb().prepare('SELECT * FROM Customer WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(row);
});

// Crear un cliente
router.post('/', (req, res) => {
  const { name, phone } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  const info = getDb()
    .prepare('INSERT INTO Customer (name, phone) VALUES (?, ?)')
    .run(name.trim(), phone || null);
  const created = getDb().prepare('SELECT * FROM Customer WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Editar un cliente
router.put('/:id', (req, res) => {
  const { name, phone } = req.body ?? {};
  const db = getDb();
  const existing = db.prepare('SELECT id FROM Customer WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  db.prepare('UPDATE Customer SET name = ?, phone = ? WHERE id = ?').run(
    name.trim(),
    phone || null,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM Customer WHERE id = ?').get(req.params.id));
});

// Eliminar un cliente
router.delete('/:id', (req, res) => {
  const info = getDb().prepare('DELETE FROM Customer WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ deleted: true, id: Number(req.params.id) });
});

export default router;