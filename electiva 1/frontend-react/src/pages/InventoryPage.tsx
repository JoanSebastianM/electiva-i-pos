import { useState } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useInventory } from '../hooks/useInventory';

interface Props { isAdmin: boolean }

export default function InventoryPage({ isAdmin }: Props) {
  const { items, loading, error, updateStock, setError } = useInventory();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState('');

  const save = async (id: number): Promise<void> => {
    const item = items.find((i) => i.id === id);
    const raw = drafts[id] ?? String(item?.stock ?? '');
    const value = Number(raw);
    if (raw.trim() === '' || !Number.isInteger(value) || value < 0) { setError('Stock invalido'); return; }
    try {
      await updateStock(id, value);
      setMsg('Inventario actualizado.');
      setDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error actualizando inventario');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-bold">Inventario</h2>
      <p className="text-sm text-slate-500">{isAdmin ? 'Actualiza stock real sobre el backend compartido.' : 'Consulta de inventario.'}</p>
      <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
      {loading ? <p>Cargando...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Producto</th><th>Stock</th><th>Estado</th>{isAdmin && <th>Ajustar</th>}</tr></thead>
            <tbody>{items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{item.name}</td>
                <td>{item.stock}</td>
                <td>{Number(item.stock) <= 5 ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Bajo</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">OK</span>}</td>
                {isAdmin && <td className="py-2"><div className="flex gap-2"><input className="w-28 rounded-xl border px-3 py-2" type="number" min="0" step="1" value={drafts[item.id] ?? String(item.stock)} onChange={(e) => setDrafts({ ...drafts, [item.id]: e.target.value })} /><StyledButton variant="secondary" onClick={() => void save(item.id)}>Guardar</StyledButton></div></td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
