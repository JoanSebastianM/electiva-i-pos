import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo, FilaCampos } from '../components/Formulario';

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

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    { key: 'name', header: 'Nombre' },
    { key: 'unit', header: 'Unidad' },
    { key: 'stock', header: 'Stock', className: 'right' },
    {
      key: 'actions',
      header: '',
      render: (i) => (
        <div className="btn-row">
          <button className="btn btn-sm" onClick={() => openEdit(i)}>
            Editar
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(i)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

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

      <Tabla columns={columns} rows={rows} loading={loading} empty="No hay ingredientes" />

      {open && (
        <Modal
          title={editing ? `Editar: ${editing.name}` : 'Nuevo ingrediente'}
          onClose={() => setOpen(false)}
        >
          <Formulario
            onSubmit={submit}
            onCancel={() => setOpen(false)}
            saving={saving}
            submitLabel={editing ? 'Guardar cambios' : 'Crear ingrediente'}
          >
            <Campo label="Nombre *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Jarabe de Maracuya"
                autoFocus
              />
            </Campo>
            <FilaCampos>
              <Campo label="Unidad">
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="unidad">unidad</option>
                </select>
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
          </Formulario>
        </Modal>
      )}
    </div>
  );
}
