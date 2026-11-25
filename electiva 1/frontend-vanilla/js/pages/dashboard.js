import { api } from '../api/client.js';
import { formatMoney, esc } from '../utils/format.js';
export async function renderDashboard() {
  const [products, sales] = await Promise.all([api.products.list(), api.sales.list()]);
  const low = products.filter(p => Number(p.stock) <= 5);
  const inventory = products.reduce((a,p)=>a+Number(p.stock||0),0);
  const totalSales = sales.reduce((a,s)=>a+Number(s.total||0),0);
  return `<div class="cards">
    <div class="card"><div class="muted">Productos</div><div class="value">${products.length}</div></div>
    <div class="card"><div class="muted">Inventario</div><div class="value">${inventory}</div></div>
    <div class="card"><div class="muted">Stock bajo</div><div class="value">${low.length}</div></div>
    <div class="card"><div class="muted">Ventas</div><div class="value">${formatMoney(totalSales)}</div></div>
  </div>
  <div class="panel"><h3>Productos con poco stock</h3><table><thead><tr><th>Producto</th><th>Stock</th></tr></thead><tbody>
    ${low.length?low.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.stock}</td></tr>`).join(''):'<tr><td colspan="2" class="muted">Sin alertas</td></tr>'}
  </tbody></table></div>`;
}
