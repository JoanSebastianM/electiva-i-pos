import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Customer, CustomerPayload } from '../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setCustomers(await api.customers.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (payload: CustomerPayload, id?: number): Promise<void> => {
    if (id) await api.customers.update(id, payload);
    else await api.customers.create(payload);
    await load();
  };

  const remove = async (id: number): Promise<void> => {
    try {
      await api.customers.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando cliente');
    }
  };

  return { customers, loading, error, load, save, remove, setError };
}
