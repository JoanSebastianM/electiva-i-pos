// Cliente HTTP simple que consume la API del backend Express.
// El proxy de Vite redirige /api al servidor en localhost:3001.
const BASE = '/api';

async function http(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data && data.error) || `Error ${res.status}`);
  }
  return data;
}

const crud = (name, withSearch = false) => ({
  list: () => http('GET', `/${name}`),
  get: (id) => http('GET', `/${name}/${id}`),
  create: (data) => http('POST', `/${name}`, data),
  update: (id, data) => http('PUT', `/${name}/${id}`, data),
  remove: (id) => http('DELETE', `/${name}/${id}`),
  ...(withSearch ? { search: (q) => http('GET', `/${name}?search=${encodeURIComponent(q)}`) } : {})
});

export const api = {
  products: crud('products', true),
  categories: crud('categories'),
  ingredients: crud('ingredients'),
  customers: crud('customers', true),
  sales: crud('sales'),
  health: () => http('GET', '/health')
};

export function formatMoney(n) {
  return '$ ' + Number(n ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}