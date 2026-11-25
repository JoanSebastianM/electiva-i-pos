import type { AuthResponse, Category, CategoryPayload, Customer, CustomerPayload, Ingredient, IngredientPayload, Product, ProductPayload, RecipeItem, RecipePayload, Sale, SalePayload, User, UserPayload } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-pos-client': 'pos-granizados'
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data as { error?: string }).error) || `Error ${res.status}`);
  }
  return data as T;
}

const crud = <T, P = Partial<T>>(name: string, withSearch = false) => ({
  list: (order?: string) => http<T[]>('GET', `/${name}${order ? `?order=${encodeURIComponent(order)}` : ''}`),
  get: (id: number) => http<T>('GET', `/${name}/${id}`),
  create: (data: P) => http<T>('POST', `/${name}`, data),
  update: (id: number, data: P) => http<T>('PUT', `/${name}/${id}`, data),
  remove: (id: number) => http<{ deleted: boolean; id: number }>('DELETE', `/${name}/${id}`),
  ...(withSearch ? { search: (q: string, order?: string) => http<T[]>('GET', `/${name}?search=${encodeURIComponent(q)}${order ? `&order=${encodeURIComponent(order)}` : ''}`) } : {})
});

export const api = {
  auth: {
    login: (username: string, password: string) => http<AuthResponse>('POST', '/auth/login', { username, password }),
    me: () => http<AuthResponse>('GET', '/auth/me'),
    logout: () => http<{ ok: boolean }>('POST', '/auth/logout')
  },
  users: crud<User, UserPayload>('users', true),
  products: crud<Product, ProductPayload>('products', true),
  categories: crud<Category, CategoryPayload>('categories'),
  ingredients: crud<Ingredient, IngredientPayload>('ingredients'),
  customers: crud<Customer, CustomerPayload>('customers', true),
  inventory: {
    list: () => http<Product[]>('GET', '/inventory'),
    update: (id: number, data: { stock?: number; delta?: number }) => http<Product>('PUT', `/inventory/${id}`, data)
  },
  sales: {
    list: () => http<Sale[]>('GET', '/sales'),
    create: (data: SalePayload) => http<Sale>('POST', '/sales', data),
    remove: (id: number) => http<{ deleted: boolean; id: number }>('DELETE', `/sales/${id}`)
  },
  recipes: {
    get: (productId: number) => http<RecipeItem[]>('GET', `/products/${productId}/recipes`),
    update: (productId: number, data: RecipePayload) => http<RecipeItem[]>('PUT', `/products/${productId}/recipes`, data)
  },
  health: () => http<{ ok: boolean }>('GET', '/health')
};
