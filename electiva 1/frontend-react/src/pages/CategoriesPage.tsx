import { useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../types';

interface Props { isAdmin: boolean }

export default function CategoriesPage({ isAdmin }: Props) {
  const { categories, loading, error, save, remove, setError } = useCategories();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [msg, setMsg] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await save({ name }, editing?.id);
      setName('');
      setEditing(null);
      setMsg(editing ? 'Categoria actualizada.' : 'Categoria creada.');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Error guardando');
    }
  };

  return (
    <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[360px,1fr]' : ''}`}>
      {isAdmin && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold">{editing ? 'Editar categoria' : 'Nueva categoria'}</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="flex gap-2">
              <StyledButton type="submit">{editing ? 'Guardar' : 'Crear'}</StyledButton>
              {editing && <StyledButton type="button" variant="secondary" onClick={() => { setEditing(null); setName(''); }}>Cancelar</StyledButton>}
            </div>
          </div>
        </form>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Categorias</h2>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Nombre</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>{categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0"><td className="py-2 font-medium">{c.name}</td>{isAdmin && <td className="space-x-2 text-right"><button className="text-granizado-600 font-semibold" onClick={() => { setEditing(c); setName(c.name); }}>Editar</button><button className="text-red-600 font-semibold" onClick={() => void remove(c.id)}>Eliminar</button></td>}</tr>
            ))}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
