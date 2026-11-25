import { useEffect, useMemo, useState } from 'react';
import Notification from '../components/Notification';
import StyledButton from '../components/StyledButton';
import { api } from '../services/api';
import type { Ingredient, Product, RecipeItem } from '../types';

interface Props { isAdmin: boolean }

export default function RecipesPage({ isAdmin }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productId, setProductId] = useState('');
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setLoading(true);
        const [p, i] = await Promise.all([api.products.list(), api.ingredients.list()]);
        setProducts(p);
        setIngredients(i);
        if (p[0]) setProductId(String(p[0].id));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const loadRecipe = async (): Promise<void> => {
      if (!productId) { setItems([]); return; }
      try {
        setError('');
        const data = await api.recipes.get(Number(productId));
        setItems(data.map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity), ingredientName: r.ingredientName, unit: r.unit })));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando receta');
        setItems([]);
      }
    };
    void loadRecipe();
  }, [productId]);

  const availableIngredients = useMemo(() => ingredients.filter((i) => !items.some((it) => it.ingredientId === i.id)), [ingredients, items]);

  const addItem = (ingredientId: number): void => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;
    setItems([...items, { ingredientId, quantity: 1, ingredientName: ing.name, unit: ing.unit }]);
  };

  const save = async (): Promise<void> => {
    if (!productId) return;
    if (items.some((i) => !Number.isFinite(Number(i.quantity)) || Number(i.quantity) <= 0)) {
      setError('Las cantidades deben ser mayores a 0');
      setMsg('');
      return;
    }
    try {
      setError('');
      setMsg('');
      const payload = { items: items.map((i) => ({ ingredientId: i.ingredientId, quantity: Number(i.quantity) })) };
      const saved = await api.recipes.update(Number(productId), payload);
      setItems(saved.map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity), ingredientName: r.ingredientName, unit: r.unit })));
      setMsg('Receta guardada.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error guardando receta');
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-6 shadow-soft">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-bold">Recetas</h2>
            <p className="text-sm text-slate-500">Selecciona un producto y define sus ingredientes.</p>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Producto</span>
            <select className="rounded-xl border px-3 py-2" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Selecciona producto</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4"><Notification message={error} type="error" onClose={() => setError('')} /><Notification message={msg} type="success" onClose={() => setMsg('')} /></div>
        {isAdmin && (
          <div className="mb-4 flex gap-2">
            <select id="ingredient-add" className="rounded-xl border px-3 py-2" defaultValue="" onChange={(e) => { const v = Number(e.target.value); if (v) { addItem(v); e.currentTarget.value = ''; } }}>
              <option value="">Agregar ingrediente...</option>
              {availableIngredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <StyledButton onClick={() => void save()} disabled={!productId}>Guardar receta</StyledButton>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Ingrediente</th><th>Cantidad</th><th>Unidad</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={isAdmin ? 4 : 3} className="py-4 text-slate-500">Sin ingredientes en la receta.</td></tr> : items.map((item, idx) => (
                <tr key={item.ingredientId} className="border-b last:border-0">
                  <td className="py-2 font-medium">{item.ingredientName || ingredients.find((i) => i.id === item.ingredientId)?.name || item.ingredientId}</td>
                  <td>{isAdmin ? <input className="w-28 rounded-xl border px-3 py-1" type="number" min="0" step="any" value={item.quantity} onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], quantity: Number(e.target.value) }; setItems(next); }} /> : item.quantity}</td>
                  <td>{item.unit || ingredients.find((i) => i.id === item.ingredientId)?.unit || '-'}</td>
                  {isAdmin && <td className="text-right"><button className="font-semibold text-red-600" onClick={() => setItems(items.filter((_, i) => i !== idx))}>Quitar</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
