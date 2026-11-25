import { useEffect, useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { api } from '../services/api';
import type { User, UserPayload } from '../types';

const empty: UserPayload = { username: '', name: '', password: '', role: 'cajero' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<UserPayload>(empty);
  const [editing, setEditing] = useState<User | null>(null);

  const load = async (): Promise<void> => {
    try { setUsers(await api.users.list()); } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editing) {
        const payload: UserPayload = { username: form.username, name: form.name, role: form.role };
        if (form.password) payload.password = form.password;
        await api.users.update(editing.id, payload);
        setMsg('Usuario actualizado.');
      } else {
        await api.users.create(form);
        setMsg('Usuario creado.');
      }
      setForm(empty);
      setEditing(null);
      await load();
    } catch (e2) { setError(e2 instanceof Error ? e2.message : 'Error'); }
  };

  const remove = async (id: number): Promise<void> => {
    try { await api.users.remove(id); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder={editing ? 'Contrasena (opcional)' : 'Contrasena'} value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          <select className="w-full rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserPayload['role'] })}><option value="admin">admin</option><option value="cajero">cajero</option></select>
          <div className="flex gap-2"><StyledButton type="submit">{editing ? 'Guardar' : 'Crear usuario'}</StyledButton>{editing && <StyledButton type="button" variant="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</StyledButton>}</div>
        </div>
      </form>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">Usuarios</h2>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Usuario</th><th>Nombre</th><th>Rol</th><th></th></tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-b last:border-0"><td className="py-2">{u.username}</td><td>{u.name}</td><td>{u.role}</td><td className="space-x-2 text-right"><button className="font-semibold text-granizado-600" onClick={() => { setEditing(u); setForm({ username: u.username, name: u.name, role: u.role, password: '' }); }}>Editar</button><button className="font-semibold text-red-600" onClick={() => void remove(u.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
