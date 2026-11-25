import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import IngredientsPage from './pages/IngredientsPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import RecipesPage from './pages/RecipesPage';
import SalesPage from './pages/SalesPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  const { user, loading, error, login, logout, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-orange-50 text-slate-600">Cargando sesion...</div>;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={login} loading={loading} error={error} />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/productos" element={<ProductsPage isAdmin={isAdmin} />} />
        <Route path="/categorias" element={<CategoriesPage isAdmin={isAdmin} />} />
        <Route path="/ingredientes" element={<IngredientsPage isAdmin={isAdmin} />} />
        <Route path="/clientes" element={<CustomersPage isAdmin={isAdmin} />} />
        <Route path="/recetas" element={<RecipesPage isAdmin={isAdmin} />} />
        <Route path="/inventario" element={<InventoryPage isAdmin={isAdmin} />} />
        <Route path="/ventas" element={<SalesPage isAdmin={isAdmin} />} />
        <Route path="/usuarios" element={isAdmin ? <UsersPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
