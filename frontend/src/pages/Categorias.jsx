import { useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo } from '../components/Formulario';

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

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    { key: 'name', header: 'Nombre' },
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
      <h2>Categorias</h2>
      <p className="sub">Clasifica los productos del catalogo.</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <span className="muted">{rows.length} categoria(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nueva categoria
        </button>
      </div>

      <Tabla columns={columns} rows={rows} loading={loading} empty="No hay categorias" />

      {open && (
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nueva categoria'} onClose={() => setOpen(false)}>
          <Formulario
            onSubmit={submit}
            onCancel={() => setOpen(false)}
            saving={saving}
            submitLabel={editing ? 'Guardar cambios' : 'Crear categoria'}
          >
            <Campo label="Nombre *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Granizados"
                autoFocus
              />
            </Campo>
          </Formulario>
        </Modal>
      )}
    </div>
  );
}
