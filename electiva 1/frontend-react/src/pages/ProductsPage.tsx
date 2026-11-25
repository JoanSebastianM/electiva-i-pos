import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useProducts } from '../hooks/useProducts';
import { formatMoney } from '../utils/format';
import type { Product, ProductPayload } from '../types';

const empty: ProductPayload = { name: '', categoryId: null, price: 0, stock: 0 };

interface Props { isAdmin: boolean }

export default function ProductsPage({ isAdmin }: Props) {
  const { products, categories, loading, error, load, save, remove, setError } = useProducts();
  const [form, setForm] = useState<ProductPayload>(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [order, setOrder] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { void load(search, order); }, [load, search, order]);

  const filtered = useMemo(() => products.filter((p) => {
    const bySearch = p.name.toLowerCase().includes(search.toLowerCase());
    const byCat = !categoryFilter || String(p.categoryId || '') === categoryFilter;
    return bySearch && byCat;
  }), [products, search, categoryFilter]);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await save({ ...form, categoryId: form.categoryId ? Number(form.categoryId) : null, price: Number(form.price), stock: Number(form.stock) }, editing?.id);
      setForm(empty); setEditing(null); setMsg(editing ? 'Producto actualizado.' : 'Producto creado.');
    } catch (e2) { setError(e2 instanceof Error ? e2.message : 'Error guardando'); }
  };

  return (
    <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[360px,1fr]' : ''}`}>
      {isAdmin && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="w-full rounded-xl border px-3 py-2" value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Sin categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="w-full rounded-xl border px-3 py-2" type="number" min="0" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <input className="w-full rounded-xl border px-3 py-2" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            <div className="flex gap-2"><StyledButton type="submit">{editing ? 'Guardar' : 'Crear'}</StyledButton>{editing && <StyledButton type="button" variant="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</StyledButton>}</div>
          </div>
        </form>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input className="rounded-xl border px-3 py-2" placeholder="Buscar por nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="rounded-xl border px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Todas las categorias</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border px-3 py-2" value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="">Orden: nombre</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
        <Notification message={error} type="error" onClose={() => setError('')} />
        <Notification message={msg} type="success" onClose={() => setMsg('')} />
        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Nombre</th><th>Categoria</th><th>Precio</th><th>Stock</th>{isAdmin && <th></th>}</tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4} className="py-4 text-slate-500">Sin resultados.</td></tr> : filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0"><td className="py-2 font-medium">{p.name}</td><td>{p.categoryName || '-'}</td><td>{formatMoney(p.price)}</td><td>{p.stock}</td>{isAdmin && <td className="space-x-2 text-right"><button className="text-granizado-600 font-semibold" onClick={() => { setEditing(p); setForm({ name: p.name, categoryId: p.categoryId, price: p.price, stock: p.stock }); }}>Editar</button><button className="text-red-600 font-semibold" onClick={() => void remove(p.id)}>Eliminar</button></td>}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
