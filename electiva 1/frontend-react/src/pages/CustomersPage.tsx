import { useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer, CustomerPayload } from '../types';

interface Props { isAdmin: boolean }

const empty: CustomerPayload = { name: '', phone: '' };

export default function CustomersPage({ isAdmin }: Props) {
  const { customers, loading, error, save, remove, setError } = useCustomers();
  const [form, setForm] = useState<CustomerPayload>(empty);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [msg, setMsg] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await save({ name: form.name, phone: form.phone || null }, editing?.id);
      setForm(empty);
      setEditing(null);
      setMsg(editing ? 'Cliente actualizado.' : 'Cliente creado.');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Error guardando');
    }
  };

  return (
    <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[360px,1fr]' : ''}`}>
      {isAdmin && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold">{editing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Telefono" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="flex gap-2">
              <StyledButton type="submit">{editing ? 'Guardar' : 'Crear'}</StyledButton>
              {editing && <StyledButton type="button" variant="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</StyledButton>}
            </div>
          </div>
        </form>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Clientes</h2>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Nombre</th><th>Telefono</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>{customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0"><td className="py-2 font-medium">{c.name}</td><td>{c.phone || '-'}</td>{isAdmin && <td className="space-x-2 text-right"><button className="text-granizado-600 font-semibold" onClick={() => { setEditing(c); setForm({ name: c.name, phone: c.phone || '' }); }}>Editar</button><button className="text-red-600 font-semibold" onClick={() => void remove(c.id)}>Eliminar</button></td>}</tr>
            ))}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
