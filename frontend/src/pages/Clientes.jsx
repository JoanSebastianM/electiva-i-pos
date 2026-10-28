import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo } from '../components/Formulario';

export default function Clientes() {
  const { rows, loading, error, save, remove, setError, search, setSearch } = useCrud(api.customers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setError(null);
    setEditing(null);
    setForm({ name: '', phone: '' });
    setOpen(true);
  };

  const openEdit = (row) => {
    setError(null);
    setEditing(row);
    setForm({ name: row.name, phone: row.phone ?? '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      setSaving(true);
      await save({ name: form.name.trim(), phone: form.phone.trim() || null }, editing?.id);
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar al cliente "${row.name}"?`)) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message || 'Error al eliminar el cliente');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'phone',
      header: 'Telefono',
      render: (c) => c.phone || <span className="muted">-</span>
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="btn-row">
          <button className="btn btn-sm" onClick={() => openEdit(c)}>
            Editar
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(c)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

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

      <Tabla columns={columns} rows={rows} loading={loading} empty="No hay clientes" />

      {open && (
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nuevo cliente'} onClose={() => setOpen(false)}>
          <Formulario
            onSubmit={submit}
            onCancel={() => setOpen(false)}
            saving={saving}
            submitLabel={editing ? 'Guardar cambios' : 'Crear cliente'}
          >
            <Campo label="Nombre *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Carlos Perez"
                autoFocus
              />
            </Campo>
            <Campo label="Telefono">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </Campo>
          </Formulario>
        </Modal>
      )}
    </div>
  );
}
