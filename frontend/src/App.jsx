import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Ingredientes from './pages/Ingredientes';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/ingredientes" element={<Ingredientes />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}