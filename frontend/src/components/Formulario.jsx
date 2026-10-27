export function Campo({ label, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export function FilaCampos({ children }) {
  return <div className="field-row">{children}</div>;
}

export default function Formulario({
  onSubmit,
  children,
  onCancel,
  cancelLabel = 'Cancelar',
  submitLabel,
  saving = false,
  submitStyle,
  submitClassName = 'btn btn-primary'
}) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button type="submit" className={submitClassName} disabled={saving} style={submitStyle}>
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
