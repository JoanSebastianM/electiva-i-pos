import { useState, type FormEvent } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string;
}

export default function LoginPage({ onLogin, loading, error }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-lime-100 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex rounded-full bg-granizado-500 px-3 py-1 text-xs font-bold text-white">POS GRANIZADOS</div>
          <h1 className="text-3xl font-bold text-slate-900">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-slate-500">Ingresa con tu usuario del sistema.</p>
        </div>
        <Notification message={error} type="error" />
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Usuario</span>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-granizado-500" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Contrasena</span>
          <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-granizado-500" placeholder="Contrasena" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <StyledButton type="submit" disabled={loading} className="w-full py-3">{loading ? 'Ingresando...' : 'Entrar'}</StyledButton>
      </form>
    </div>
  );
}
