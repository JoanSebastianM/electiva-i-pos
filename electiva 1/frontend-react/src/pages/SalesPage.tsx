import { useMemo, useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useSales } from '../hooks/useSales';
import { formatDate, formatMoney } from '../utils/format';

interface Props { isAdmin: boolean }

export default function SalesPage({ isAdmin }: Props) {
  const { sales, products, loading, error, create, remove, setError } = useSales();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState('');

  const selected = useMemo(() => products.find((p) => p.id === Number(productId)), [products, productId]);
  const total = (selected?.price || 0) * quantity;

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!selected) { setError('Selecciona un producto'); return; }
    if (!Number.isInteger(quantity) || quantity < 1) { setError('Cantidad invalida'); return; }
    if (quantity > selected.stock) { setError('Stock insuficiente'); return; }
    try {
      await create({ productId: selected.id, quantity });
      setMsg('Venta registrada.');
      setProductId(''); setQuantity(1);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Error registrando la venta');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Registrar venta</h2>
        <p className="text-sm text-slate-500">Usa el modelo real del backend: una venta por producto/cantidad.</p>
        <div className="mt-4 space-y-3">
          <select className="w-full rounded-xl border px-3 py-2" value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Selecciona producto</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} - stock {p.stock}</option>)}
          </select>
          <input className="w-full rounded-xl border px-3 py-2" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          <div className="rounded-xl bg-orange-50 p-3 text-sm text-slate-700">
            <div>Precio unitario: <strong>{formatMoney(selected?.price || 0)}</strong></div>
            <div>Total: <strong>{formatMoney(total)}</strong></div>
          </div>
          <StyledButton type="submit" disabled={!selected}>Registrar venta</StyledButton>
        </div>
      </form>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Historial</h2>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Fecha</th><th>Producto</th><th>Cant.</th><th>Total</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>{sales.map((s) => {
              const first = s.items?.[0];
              return <tr key={s.id} className="border-b last:border-0"><td className="py-2">{formatDate(s.createdAt)}</td><td>{first?.productName || s.productName || '-'}</td><td>{first?.quantity || s.quantity || '-'}</td><td>{formatMoney(s.total)}</td>{isAdmin && <td className="text-right"><button className="font-semibold text-red-600" onClick={() => void remove(s.id)}>Eliminar</button></td>}</tr>;
            })}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
