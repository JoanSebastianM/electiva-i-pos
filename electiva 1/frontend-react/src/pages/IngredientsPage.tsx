import { useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useIngredients } from '../hooks/useIngredients';
import type { Ingredient, IngredientPayload } from '../types';

interface Props { isAdmin: boolean }

const empty: IngredientPayload = { name: '', unit: '', stock: 0 };

export default function IngredientsPage({ isAdmin }: Props) {
  const { ingredients, loading, error, save, remove, setError } = useIngredients();
  const [form, setForm] = useState<IngredientPayload>(empty);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [msg, setMsg] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await save({ ...form, stock: Number(form.stock) }, editing?.id);
      setForm(empty);
      setEditing(null);
      setMsg(editing ? 'Ingrediente actualizado.' : 'Ingrediente creado.');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Error guardando');
    }
  };

  return (
    <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[360px,1fr]' : ''}`}>
      {isAdmin && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold">{editing ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Unidad" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
            <input className="w-full rounded-xl border px-3 py-2" type="number" min="0" step="any" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            <div className="flex gap-2">
              <StyledButton type="submit">{editing ? 'Guardar' : 'Crear'}</StyledButton>
              {editing && <StyledButton type="button" variant="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</StyledButton>}
            </div>
          </div>
        </form>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Ingredientes</h2>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Nombre</th><th>Unidad</th><th>Stock</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>{ingredients.map((i) => (
              <tr key={i.id} className="border-b last:border-0"><td className="py-2 font-medium">{i.name}</td><td>{i.unit}</td><td>{i.stock}</td>{isAdmin && <td className="space-x-2 text-right"><button className="text-granizado-600 font-semibold" onClick={() => { setEditing(i); setForm({ name: i.name, unit: i.unit, stock: i.stock }); }}>Editar</button><button className="text-red-600 font-semibold" onClick={() => void remove(i.id)}>Eliminar</button></td>}</tr>
            ))}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
