import { NavLink, Outlet } from 'react-router-dom';
import type { User } from '../types';
import StyledButton from './StyledButton';

interface LayoutProps {
  user: User | null;
  onLogout: () => void | Promise<void>;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const isAdmin = user?.role === 'admin';
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/productos', label: 'Productos' },
    { to: '/categorias', label: 'Categorías' },
    { to: '/ingredientes', label: 'Ingredientes' },
    { to: '/clientes', label: 'Clientes' },
    { to: '/recetas', label: 'Recetas' },
    { to: '/inventario', label: 'Inventario' },
    { to: '/ventas', label: 'Ventas' },
    ...(isAdmin ? [{ to: '/usuarios', label: 'Usuarios' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-lime-50">
      <header className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-granizado-500 px-3 py-1 text-xs font-bold tracking-wide text-white">POS GRANIZADOS</div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Panel React</h1>
            <p className="text-sm text-slate-500">Frontend React + TypeScript + Tailwind, conectado al backend compartido.</p>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-slate-600">Hola, <strong>{user.name}</strong> ({user.role})</span>}
            {user && <StyledButton variant="secondary" onClick={() => void onLogout()}>Salir</StyledButton>}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold ${isActive ? 'bg-granizado-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-orange-50'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
