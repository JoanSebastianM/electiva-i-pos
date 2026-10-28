import { useEffect, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api, formatMoney } from '../api';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo, FilaCampos } from '../components/Formulario';

const emptyForm = { name: '', price: '', stock: '', categoryId: '' };

export default function Productos() {
  const { rows, loading, error, save, remove, setError, search, setSearch } = useCrud(api.products);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setError(null);
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setError(null);
    setEditing(row);
    setForm({ name: row.name, price: row.price, stock: row.stock, categoryId: row.categoryId ?? '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
      return setError('El precio debe ser un numero mayor o igual a 0');
    }
    const stockNum = form.stock === '' ? 0 : Number(form.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return setError('El stock debe ser un numero mayor o igual a 0');
    }
    try {
      setSaving(true);
      await save(
        {
          name: form.name.trim(),
          price: Number(form.price),
          stock: stockNum,
          categoryId: form.categoryId ? Number(form.categoryId) : null
        },
        editing?.id
      );
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar el producto "${row.name}"?`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'categoryName',
      header: 'Categoria',
      render: (p) =>
        p.categoryName ? (
          <span className="badge-pill">{p.categoryName}</span>
        ) : (
          <span className="muted">-</span>
        )
    },
    { key: 'price', header: 'Precio', className: 'right', render: (p) => formatMoney(p.price) },
    { key: 'stock', header: 'Stock', className: 'right' },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="btn-row">
          <button className="btn btn-sm" onClick={() => openEdit(p)}>
            Editar
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

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

      <Tabla columns={columns} rows={rows} loading={loading} empty="No hay productos" />

      {open && (
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nuevo producto'} onClose={() => setOpen(false)}>
          <Formulario
            onSubmit={submit}
            onCancel={() => setOpen(false)}
            saving={saving}
            submitLabel={editing ? 'Guardar cambios' : 'Crear producto'}
          >
            <Campo label="Nombre *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Granizado Maracuya"
                autoFocus
              />
            </Campo>
            <FilaCampos>
              <Campo label="Precio *">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Campo>
              <Campo label="Stock">
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </Campo>
            </FilaCampos>
            <Campo label="Categoria">
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Sin categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Campo>
          </Formulario>
        </Modal>
      )}
    </div>
  );
}
