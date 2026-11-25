import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

const KEY = 'pos-granizados-user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const res = await api.auth.me();
      setUser(res.user);
      localStorage.setItem(KEY, JSON.stringify(res.user));
    } catch {
      setUser(null);
      localStorage.removeItem(KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      await api.auth.login(username, password);
      const res = await api.auth.me();
      setUser(res.user);
      localStorage.setItem(KEY, JSON.stringify(res.user));
      return true;
    } catch (e) {
      setUser(null);
      localStorage.removeItem(KEY);
      setError(e instanceof Error ? e.message : 'Error de autenticacion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch {
      setUser(null);
    } finally {
      setUser(null);
      localStorage.removeItem(KEY);
    }
  };

  return { user, loading, error, login, logout, refresh, isAuthenticated: !!user };
}
