import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Ingredient, IngredientPayload } from '../types';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setIngredients(await api.ingredients.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando ingredientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (payload: IngredientPayload, id?: number): Promise<void> => {
    if (id) await api.ingredients.update(id, payload);
    else await api.ingredients.create(payload);
    await load();
  };

  const remove = async (id: number): Promise<void> => {
    try {
      await api.ingredients.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando ingrediente');
    }
  };

  return { ingredients, loading, error, load, save, remove, setError };
}
