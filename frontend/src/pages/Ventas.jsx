import { useEffect, useMemo, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api, formatMoney } from '../api';

export default function Ventas() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.sales);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

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
      await save({ productId: Number(productId), quantity: Number(quantity) });
      setProductId('');
      setQuantity('1');
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async (sale) => {
    if (!confirm(`¿Eliminar la venta #${sale.id}?`)) return;
    try {
      await remove(sale.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Ventas</h2>
      <p className="sub">
        Registra una venta: el total se calcula con el precio del producto.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={submit} className="panel" style={{ marginBottom: 22 }}>
        <div className="field-row">
          <div className="field">
            <label>Producto *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatMoney(p.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cantidad *</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <div className="field-row" style={{ alignItems: 'center' }}>
          <div className="muted" style={{ fontSize: 13 }}>
            Precio unitario: <strong style={{ color: 'var(--text)' }}>{formatMoney(unitPrice)}</strong>
          </div>
          <div className="right">
            <span className="total-ventas">Total: {formatMoney(total)}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Registrar venta
          </button>
        </div>
      </form>

      <div className="toolbar">
        <span className="muted">
          {rows.length} venta(s) · Total acumulado:{' '}
          <strong className="total-ventas" style={{ padding: '3px 9px' }}>
            {formatMoney(totalVentas)}
          </strong>
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th className="right">Cant.</th>
              <th className="right">P. unit.</th>
              <th className="right">Total</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  Aun no hay ventas registradas
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td className="muted">{s.id}</td>
                  <td>{s.productName}</td>
                  <td className="right">{s.quantity}</td>
                  <td className="right">{formatMoney(s.unitPrice)}</td>
                  <td className="right">{formatMoney(s.total)}</td>
                  <td className="muted">{s.createdAt}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(s)}>
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
    </div>
  );
}