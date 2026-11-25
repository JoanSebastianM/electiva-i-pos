import { useCrud } from '../hooks/useCrud';
import { useCrudForm } from '../hooks/useCrudForm';
import { api } from '../api';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';
import Formulario, { Campo } from '../components/Formulario';

export default function Categorias() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.categories);
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
    initialForm: { name: '' },
    fromRow: (row) => ({ name: row.name }),
    validate: (values) => (values.name.trim() ? '' : 'El nombre es obligatorio'),
    toPayload: (values) => ({ name: values.name.trim() }),
    deleteMessage: (row) =>
      `¿Eliminar la categoria "${row.name}"? Los productos asociados quedaran sin categoria.`
  });

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
        <Modal title={editing ? `Editar: ${editing.name}` : 'Nueva categoria'} onClose={close}>
          <Formulario
            onSubmit={submit}
            onCancel={close}
            saving={saving}
            submitLabel={editing ? 'Guardar cambios' : 'Crear categoria'}
          >
            <Campo label="Nombre *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
