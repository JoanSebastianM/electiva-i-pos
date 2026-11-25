import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category, CategoryPayload } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setCategories(await api.categories.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (payload: CategoryPayload, id?: number): Promise<void> => {
    if (id) await api.categories.update(id, payload);
    else await api.categories.create(payload);
    await load();
  };

  const remove = async (id: number): Promise<void> => {
    try {
      await api.categories.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando categoria');
    }
  };

  return { categories, loading, error, load, save, remove, setError };
}
