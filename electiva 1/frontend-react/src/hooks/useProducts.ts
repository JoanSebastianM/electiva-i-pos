import { useCallback, useState } from 'react';
import { api } from '../services/api';
import type { Category, Product, ProductPayload } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (search = '', order = '') => {
    try {
      setLoading(true);
      setError('');
      const searchProducts = api.products.search;
      const [p, c] = await Promise.all([
        search && searchProducts ? searchProducts(search, order) : api.products.list(order),
        api.categories.list()
      ]);
      setProducts(p);
      setCategories(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = async (payload: ProductPayload, id?: number): Promise<void> => {
    if (id) await api.products.update(id, payload);
    else await api.products.create(payload);
    await load();
  };

  const remove = async (id: number): Promise<void> => {
    try {
      await api.products.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando producto');
    }
  };

  return { products, categories, loading, error, load, save, remove, setError };
}
