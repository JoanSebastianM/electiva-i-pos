import { useCallback, useEffect, useState } from 'react';

/**
 * Logica comun para una pagina CRUD:
 * - carga la lista (con busqueda opcional)
 * - guarda (crear/editar) y elimina llamando al backend
 * - maneja error y estado de carga
 */
export function useCrud(apiCrud) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data =
        apiCrud.search && search.trim()
          ? await apiCrud.search(search.trim())
          : await apiCrud.list();
      setRows(data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiCrud, search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (data, id) => {
      const saved = id ? await apiCrud.update(id, data) : await apiCrud.create(data);
      await reload();
      return saved;
    },
    [apiCrud, reload]
  );

  const remove = useCallback(
    async (id) => {
      await apiCrud.remove(id);
      await reload();
    },
    [apiCrud, reload]
  );

  return { rows, loading, error, reload, save, remove, setError, search, setSearch };
}