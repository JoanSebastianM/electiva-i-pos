import { useState } from 'react';

/**
 * Estado y acciones comunes del formulario de una pagina CRUD:
 * apertura del modal, modo edicion, validacion, guardado y eliminacion.
 */
export function useCrudForm({
  save,
  remove,
  setError,
  initialForm,
  fromRow,
  validate,
  toPayload,
  deleteMessage
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...initialForm });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(fromRow(row));
    setOpen(true);
  };

  const close = () => setOpen(false);

  const submit = async (e) => {
    e.preventDefault();
    const message = validate?.(form);
    if (message) return setError(message);

    try {
      setSaving(true);
      await save(toPayload(form), editing?.id);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(deleteMessage(row))) return;
    try {
      await remove(row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return { open, editing, form, setForm, saving, openCreate, openEdit, close, submit, onDelete };
}
