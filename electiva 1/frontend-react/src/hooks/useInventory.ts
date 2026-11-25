import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product } from '../types';

export function useInventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setItems(await api.inventory.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateStock = async (id: number, stock: number): Promise<void> => {
    await api.inventory.update(id, { stock });
    await load();
  };

  return { items, loading, error, load, updateStock, setError };
}
