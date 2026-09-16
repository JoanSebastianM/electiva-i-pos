import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';

export default function Clientes() {
  const { rows, loading, error, save, remove, setError, search, setSearch } = useCrud(api.customers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '' });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, phone: row.phone ?? '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      setSaving(true);
      await save({ name: form.name.trim(), phone: form.phone.trim() || null }, editing?.id);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar al cliente "${row.name}"?`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Clientes</h2>
      <p className="sub">Base de datos de clientes con nombre y telefono.</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo cliente
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Telefono</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty">
                  No hay clientes
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id}>
                  <td className="muted">{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.phone || <span className="muted">-</span>}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm" onClick={() => openEdit(c)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(c)}>
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
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nuevo cliente'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Carlos Perez"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Telefono</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}