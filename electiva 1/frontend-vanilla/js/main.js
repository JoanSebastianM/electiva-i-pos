import { api } from './api/client.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProducts } from './pages/products.js';
import { renderCategories } from './pages/categories.js';
import { renderIngredients } from './pages/ingredients.js';
import { renderCustomers } from './pages/customers.js';
import { renderInventory } from './pages/inventory.js';
import { renderSales } from './pages/sales.js';
import { renderUsers } from './pages/users.js';
import { renderRecipes } from './pages/recipes.js';
import { esc } from './utils/format.js';

const routeLabels = {
  dashboard: 'Dashboard',
  productos: 'Productos',
  categorias: 'Categorias',
  ingredientes: 'Ingredientes',
  clientes: 'Clientes',
  recetas: 'Recetas',
  inventario: 'Inventario',
  ventas: 'Ventas',
  usuarios: 'Usuarios'
};

const state = { user: null, loading: true, route: 'dashboard', msg: '', err: '' };
const routes = {
  dashboard: renderDashboard,
  productos: renderProducts,
  categorias: renderCategories,
  ingredientes: renderIngredients,
  clientes: renderCustomers,
  recetas: renderRecipes,
  inventario: renderInventory,
  ventas: renderSales,
  usuarios: renderUsers
};

function setMsg(msg = '', err = '') {
  state.msg = msg;
  state.err = err;
  void render();
}

async function logout() {
  try { await api.auth.logout(); } catch {}
  state.user = null;
  state.route = 'dashboard';
  state.msg = 'Sesion cerrada';
  state.err = '';
  void render();
}

async function render() {
  const root = document.getElementById('app');
  if (state.loading) {
    root.innerHTML = '<div class="login"><div class="panel">Verificando sesion...</div></div>';
    return;
  }
  if (!state.user) {
    root.innerHTML = renderLogin(state);
    bindLogin();
    return;
  }

  const page = routes[state.route] || renderDashboard;
  let content = '<div class="panel">Cargando...</div>';
  let bind = null;
  try {
    const result = await page({ state, setMsg, rerender: render });
    if (typeof result === 'string') content = result;
    else { content = result.html; bind = result.bind || null; }
  } catch (error) {
    if (/Sesion/i.test(error.message)) {
      state.user = null;
      state.err = error.message;
      void render();
      return;
    }
    content = `<div class="panel msg error">${esc(error.message)}</div>`;
  }

  const canAdmin = state.user.role === 'admin';
  const visibleRoutes = Object.keys(routes).filter((route) => route !== 'usuarios' || canAdmin);

  root.innerHTML = `
  <div class="app">
    <div class="topbar">
      <div class="brand"><span class="badge">POS GRANIZADOS</span><h1>Frontend Vanilla</h1><div class="muted">HTML + CSS + JS consumiendo el backend compartido</div></div>
      <div class="row"><span class="muted">Hola, <strong>${esc(state.user.name)}</strong> (${esc(state.user.role)})</span><button class="btn" id="logoutBtn">Salir</button></div>
    </div>
    <div class="nav">
      ${visibleRoutes.map((route) => `<button data-route="${route}" class="${state.route === route ? 'active' : ''}">${routeLabels[route]}</button>`).join('')}
    </div>
    ${state.err ? `<div class="msg error">${esc(state.err)}</div>` : ''}
    ${state.msg ? `<div class="msg ok">${esc(state.msg)}</div>` : ''}
    <div id="content">${content}</div>
  </div>`;

  root.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => {
    state.route = button.dataset.route;
    state.msg = '';
    state.err = '';
    void render();
  }));
  document.getElementById('logoutBtn').addEventListener('click', () => { void logout(); });
  if (bind) bind();
}

function bindLogin() {
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    try {
      const res = await api.auth.login(fd.get('username'), fd.get('password'));
      state.user = res.user;
      state.route = 'dashboard';
      state.msg = '';
      state.err = '';
      void render();
    } catch (error) {
      state.err = error.message;
      void render();
    }
  });
}

async function bootstrap() {
  try {
    const res = await api.auth.me();
    state.user = res.user;
  } catch {
    state.user = null;
  } finally {
    state.loading = false;
    void render();
  }
}

void bootstrap();
