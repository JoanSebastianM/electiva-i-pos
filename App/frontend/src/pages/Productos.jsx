import { useEffect, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { useCrudForm } from '../hooks/useCrudForm';
import { api } from '../api';
import { formatMoney } from '../utils/format';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo, FilaCampos } from '../components/Formulario';

const emptyForm = { name: '', price: '', stock: '', categoryId: '' };

export default function Productos() {
  const { rows, loading, error, save, remove, setError, search, setSearch } = useCrud(api.products);
  const [categories, setCategories] = useState([]);
  const {
    open,
    editing,
    form,
    setForm,
    saving,
    openCreate,
    openEdit,
    close,
    submit,
    onDelete
  } = useCrudForm({
    save,
    remove,
    setError,
    initialForm: emptyForm,
    fromRow: (row) => ({
      name: row.name,
      price: row.price,
      stock: row.stock,
      categoryId: row.categoryId ?? ''
    }),
    validate: (values) => {
      if (!values.name.trim()) return 'El nombre es obligatorio';
      if (values.price === '' || isNaN(Number(values.price)) || Number(values.price) < 0) {
        return 'El precio debe ser un numero mayor o igual a 0';
      }
      return '';
    },
    toPayload: (values) => ({
      name: values.name.trim(),
      price: Number(values.price),
      stock: Number(values.stock || 0),
      categoryId: values.categoryId ? Number(values.categoryId) : null
    }),
    deleteMessage: (row) => `¿Eliminar el producto "${row.name}"?`
  });

  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nuevo producto'} onClose={close}>
          <Formulario
            onSubmit={submit}
            onCancel={close}
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
