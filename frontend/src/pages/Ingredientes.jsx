import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';

export default function Ingredientes() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.ingredients);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', unit: 'ml', stock: '' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', unit: 'ml', stock: '' });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, unit: row.unit, stock: row.stock });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      setSaving(true);
      await save(
        { name: form.name.trim(), unit: form.unit || 'unidad', stock: Number(form.stock || 0) },
        editing?.id
      );
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar el ingrediente "${row.name}"?`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Ingredientes</h2>
      <p className="sub">Inventario de insumos: cada ingrediente tiene unidad y stock.</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <span className="muted">{rows.length} ingrediente(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo ingrediente
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th className="right">Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  No hay ingredientes
                </td>
              </tr>
            ) : (
              rows.map((i) => (
                <tr key={i.id}>
                  <td className="muted">{i.id}</td>
                  <td>{i.name}</td>
                  <td>{i.unit}</td>
                  <td className="right">{i.stock}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm" onClick={() => openEdit(i)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(i)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={editing ? `Editar: ${editing.name}` : 'Nuevo ingrediente'}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Jarabe de Maracuya"
                autoFocus
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Unidad</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="unidad">unidad</option>
                </select>
              </div>
              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear ingrediente'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}