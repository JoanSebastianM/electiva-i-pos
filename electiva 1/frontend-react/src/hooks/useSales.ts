import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product, Sale, SalePayload } from '../types';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [s, p] = await Promise.all([api.sales.list(), api.products.list()]);
      setSales(s);
      setProducts(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (payload: SalePayload): Promise<void> => {
    await api.sales.create(payload);
    await load();
  };

  const remove = async (id: number): Promise<void> => {
    try {
      await api.sales.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando venta');
    }
  };

  return { sales, products, loading, error, load, create, remove, setError };
}
