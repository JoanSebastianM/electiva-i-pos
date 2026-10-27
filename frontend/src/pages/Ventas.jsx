import { useEffect, useMemo, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api, formatMoney } from '../api';
import Tabla from '../components/Tabla';
import Formulario, { Campo, FilaCampos } from '../components/Formulario';

export default function Ventas() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.sales);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.products
      .list()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const selected = products.find((p) => p.id === Number(productId));
  const unitPrice = selected ? selected.price : 0;
  const total = selected ? selected.price * Number(quantity || 0) : 0;

  const totalVentas = useMemo(() => rows.reduce((acc, s) => acc + Number(s.total || 0), 0), [rows]);

  const submit = async (e) => {
    e.preventDefault();
    if (!productId) return setError('Debes indicar el producto');
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)
      return setError('La cantidad debe ser un entero mayor o igual a 1');
    if (!selected)
      return setError('El producto seleccionado no existe');
    const confirmed = confirm(
      `Confirmar venta\nProducto: ${selected.name}\nCantidad: ${quantity}\nTotal: ${formatMoney(total)}`
    );
    if (!confirmed) return;
    try {
      setSaving(true);
      await save({ productId: Number(productId), quantity: Number(quantity) });
      setProductId('');
      setQuantity('1');
      const updatedProducts = await api.products.list();
      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (sale) => {
    if (!confirm(`¿Eliminar la venta #${sale.id}?`)) return;
    try {
      await remove(sale.id);
      const updatedProducts = await api.products.list();
      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    { key: 'productName', header: 'Producto' },
    { key: 'quantity', header: 'Cant.', className: 'right' },
    { key: 'unitPrice', header: 'P. unit.', className: 'right', render: (s) => formatMoney(s.unitPrice) },
    { key: 'total', header: 'Total', className: 'right', render: (s) => formatMoney(s.total) },
    { key: 'createdAt', header: 'Fecha', cellClassName: 'muted' },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="btn-row">
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(s)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="panel">
      <h2>Ventas</h2>
      <p className="sub">
        Registra una venta: el total se calcula con el precio del producto y el stock se actualiza.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <div className="panel" style={{ marginBottom: 22 }}>
        <Formulario
          onSubmit={submit}
          submitLabel="Registrar venta"
          submitStyle={{ width: '100%' }}
          saving={saving}
        >
          <FilaCampos>
            <Campo label="Producto *">
              <select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Selecciona un producto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatMoney(p.price)} (stock: {p.stock})
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Cantidad *">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Campo>
          </FilaCampos>

          <div className="field-row" style={{ alignItems: 'center' }}>
            <div className="muted" style={{ fontSize: 13 }}>
              Precio unitario: <strong style={{ color: 'var(--text)' }}>{formatMoney(unitPrice)}</strong>
            </div>
            <div className="right">
              <span className="total-ventas">Total: {formatMoney(total)}</span>
            </div>
          </div>
        </Formulario>
      </div>

      <div className="toolbar">
        <span className="muted">
          {rows.length} venta(s) · Total acumulado:{' '}
          <strong className="total-ventas" style={{ padding: '3px 9px' }}>
            {formatMoney(totalVentas)}
          </strong>
        </span>
      </div>

      <Tabla columns={columns} rows={rows} loading={loading} empty="Aun no hay ventas registradas" />
    </div>
  );
}
