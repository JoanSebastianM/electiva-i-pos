import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Productos', end: true },
  { to: '/categorias', label: 'Categorias' },
  { to: '/ingredientes', label: 'Ingredientes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ventas', label: 'Ventas' }
];

export default function Navbar() {
  return (
    <>
      <div className="topbar">
        <div className="logo">
          <span className="badge">EMBRIAGADOS</span> CRUD
        </div>
        <span className="tag">Node.js + Express + SQLite + React</span>
      </div>

      <nav className="menu">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
