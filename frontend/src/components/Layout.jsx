import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      {children}

      <footer>
        Proyecto universitario - Sistema CRUD Embriagados · Nicolás &amp; Joan
      </footer>
    </div>
  );
}
