import { useEffect, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api, formatMoney } from '../api';
import Modal from '../components/Modal';

const emptyForm = { name: '', price: '', stock: '', categoryId: '' };

export default function Productos() {
  const { rows, loading, error, save, remove, setError, search, setSearch } = useCrud(api.products);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState('name');

  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, price: row.price, stock: row.stock, categoryId: row.categoryId ?? '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setError('El precio debe ser un numero mayor o igual a 0');
    try {
      setSaving(true);
      await save(
        {
          name: form.name.trim(),
          price: Number(form.price),
          stock: Number(form.stock || 0),
          categoryId: form.categoryId ? Number(form.categoryId) : null
        },
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
    if (!confirm(`¿Eliminar el producto "${row.name}"?`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Productos</h2>
      <p className="sub">Gestiona el catalogo de productos: ver, crear, editar y eliminar.</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo producto
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th className="right">Precio</th>
              <th className="right">Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No hay productos
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="muted">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.categoryName ? <span className="badge-pill">{p.categoryName}</span> : <span className="muted">-</span>}</td>
                  <td className="right">{formatMoney(p.price)}</td>
                  <td className="right">{p.stock}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm" onClick={() => openEdit(p)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>
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
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nuevo producto'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Granizado Maracuya"
                autoFocus
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Precio *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
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
            <div className="field">
              <label>Categoria</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Sin categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}