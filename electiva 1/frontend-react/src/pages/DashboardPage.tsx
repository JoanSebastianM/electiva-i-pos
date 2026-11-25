import { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { api } from '../services/api';
import { formatMoney } from '../utils/format';
import type { Product, Sale } from '../types';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const [p, s] = await Promise.all([api.products.list(), api.sales.list()]);
        setProducts(p);
        setSales(s);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const lowStock = products.filter((p) => Number(p.stock) <= 5);
  const totalInventory = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const salesTotal = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);

  if (loading) return <div className="rounded-2xl bg-white p-6 shadow-soft">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Productos" value={products.length} detail="Registrados en el backend" />
        <DashboardCard title="Inventario" value={totalInventory} detail="Unidades totales" />
        <DashboardCard title="Stock bajo" value={lowStock.length} detail="Productos con 5 unidades o menos" />
        <DashboardCard title="Ventas" value={formatMoney(salesTotal)} detail={`${sales.length} ventas registradas`} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-slate-900">Productos con poco stock</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="py-2">Producto</th><th>Stock</th><th>Estado</th></tr></thead>
            <tbody>
              {lowStock.length === 0 ? (
                <tr><td className="py-3 text-slate-500" colSpan={3}>No hay productos con stock bajo.</td></tr>
              ) : lowStock.map((p) => (
                <tr key={p.id} className="border-b last:border-0"><td className="py-2 font-medium">{p.name}</td><td>{p.stock}</td><td><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Bajo</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
