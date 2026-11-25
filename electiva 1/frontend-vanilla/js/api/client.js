const BASE = 'http://localhost:3001/api';
const POS_CLIENT_HEADER = 'x-pos-client';
const POS_CLIENT_VALUE = 'pos-granizados';

async function http(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      [POS_CLIENT_HEADER]: POS_CLIENT_VALUE
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status === 401) throw new Error('Sesion invalida o expirada. Inicia sesion nuevamente.');
  if (!res.ok) throw new Error((data && data.error) || `Error ${res.status}`);
  return data;
}

const crud = (name) => ({
  list: () => http('GET', `/${name}`),
  get: (id) => http('GET', `/${name}/${id}`),
  create: (data) => http('POST', `/${name}`, data),
  update: (id, data) => http('PUT', `/${name}/${id}`, data),
  remove: (id) => http('DELETE', `/${name}/${id}`)
});

export const api = {
  auth: {
    login: (username, password) => http('POST', '/auth/login', { username, password }),
    me: () => http('GET', '/auth/me'),
    logout: () => http('POST', '/auth/logout')
  },
  health: () => http('GET', '/health'),
  products: crud('products'),
  categories: crud('categories'),
  customers: crud('customers'),
  ingredients: crud('ingredients'),
  users: crud('users'),
  inventory: {
    list: () => http('GET', '/inventory'),
    update: (id, data) => http('PUT', `/inventory/${id}`, data)
  },
  recipes: {
    list: (productId) => http('GET', `/products/${productId}/recipes`),
    replace: (productId, items) => http('PUT', `/products/${productId}/recipes`, { items })
  },
  sales: {
    list: () => http('GET', '/sales'),
    create: (data) => http('POST', '/sales', data),
    remove: (id) => http('DELETE', `/sales/${id}`)
  }
};
