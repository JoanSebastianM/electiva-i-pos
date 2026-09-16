import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';

export default function Categorias() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.categories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setName(row.name);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio');
    try {
      setSaving(true);
      await save({ name: name.trim() }, editing?.id);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar la categoria "${row.name}"? Los productos asociados quedaran sin categoria.`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Categorias</h2>
      <p className="sub">Clasifica los productos del catalogo.</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <span className="muted">{rows.length} categoria(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nueva categoria
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  No hay categorias
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id}>
                  <td className="muted">{c.id}</td>
                  <td>{c.name}</td>
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
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nueva categoria'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Granizados"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear categoria'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}