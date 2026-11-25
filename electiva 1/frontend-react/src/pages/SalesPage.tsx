import { useMemo, useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useSales } from '../hooks/useSales';
import { formatDate, formatMoney } from '../utils/format';

interface Props { isAdmin: boolean }

interface PendingSale {
  productId: number;
  quantity: number;
  total: number;
  productName: string;
}

export default function SalesPage({ isAdmin }: Props) {
  const { sales, products, loading, error, create, remove, setError } = useSales();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState<PendingSale | null>(null);

  const selected = useMemo(() => products.find((p) => p.id === Number(productId)), [products, productId]);
  const total = (selected?.price || 0) * quantity;

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!selected) { setPending(null); setError('Selecciona un producto'); return; }
    if (!Number.isInteger(quantity) || quantity < 1) { setPending(null); setError('Cantidad invalida'); return; }
    if (quantity > selected.stock) { setPending(null); setError('Stock insuficiente'); return; }
    setPending({ productId: selected.id, quantity, total, productName: selected.name });
    setMsg('Revisa la venta antes de confirmarla.');
  };

  const confirm = async (): Promise<void> => {
    if (!pending) return;
    setError('');
    setMsg('');
    try {
      await create({ productId: pending.productId, quantity: pending.quantity });
      setMsg('Venta registrada.');
      setPending(null);
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
          {pending && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-slate-700">
              <div>Confirmar: <strong>{pending.quantity} x {pending.productName}</strong></div>
              <div>Total a registrar: <strong>{formatMoney(pending.total)}</strong></div>
              <div className="mt-2 flex gap-2">
                <StyledButton type="button" onClick={() => void confirm()}>Confirmar venta</StyledButton>
                <StyledButton type="button" variant="secondary" onClick={() => setPending(null)}>Cancelar</StyledButton>
              </div>
            </div>
          )}
          <StyledButton type="submit" disabled={!selected}>Revisar venta</StyledButton>
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
