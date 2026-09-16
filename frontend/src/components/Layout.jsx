import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Productos', end: true },
  { to: '/categorias', label: 'Categorias' },
  { to: '/ingredientes', label: 'Ingredientes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ventas', label: 'Ventas' }
];

export default function Layout({ children }) {
  return (
    <div className="app">
      <div className="topbar">
        <div className="logo">
          <span className="badge">EMBRIAGADOS</span> CRUD
        </div>
        <span className="tag">
          Node.js + Express + SQLite + React
        </span>
      </div>

      <nav className="menu">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {children}

      <footer>
        Proyecto universitario - Sistema CRUD Embriagados · Nicolás &amp; Joan
      </footer>
    </div>
  );
}