import { api } from '../api/client.js';
import { esc, formatMoney, formatDate } from '../utils/format.js';

export async function renderSales({ state, setMsg }) {
  const canAdmin = state?.user?.role === 'admin';
  const [sales, products, customers] = await Promise.all([api.sales.list(), api.products.list(), state?.user ? api.customers.list() : Promise.resolve([])]);
  return {
    html: `<div class="grid grid-2"><div class="panel"><h3>Registrar venta</h3><form id="saleForm">
      <label>Producto<select name="productId" required><option value="">Selecciona</option>${products.map((p) => `<option value="${p.id}">${esc(p.name)} - stock ${p.stock}</option>`).join('')}</select></label>
      <label>Cliente<select name="customerId"><option value="">Mostrar</option>${customers.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
      <label>Cantidad<input name="quantity" type="number" min="1" value="1" required></label><button class="btn primary">Registrar</button></form></div>
      <div class="panel"><h3>Ventas</h3><table><thead><tr><th>Fecha</th><th>Producto</th><th>Cant.</th><th>Total</th><th>Vendedor</th>${canAdmin ? '<th></th>' : ''}</tr></thead><tbody>
      ${sales.map((s) => { const i = s.items?.[0] || {}; return `<tr><td>${esc(formatDate(s.createdAt))}</td><td>${esc(i.productName || s.productName || '-')}</td><td>${i.quantity || s.quantity || '-'}</td><td>${formatMoney(s.total)}</td><td>${esc(s.seller?.name || '-')}</td>${canAdmin ? `<td><button class="btn danger" data-sale-del="${s.id}">Eliminar</button></td>` : ''}</tr>`; }).join('')}
      </tbody></table></div></div>`,
    bind() {
      document.getElementById('saleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = { productId: Number(fd.get('productId')), quantity: Number(fd.get('quantity')) };
        if (fd.get('customerId')) payload.customerId = Number(fd.get('customerId'));
        try { await api.sales.create(payload); setMsg('Venta registrada'); }
        catch (err) { setMsg('', err.message); }
      });
      document.querySelectorAll('[data-sale-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('Eliminar venta?')) return;
        try { await api.sales.remove(b.dataset.saleDel); setMsg('Venta eliminada'); } catch (err) { setMsg('', err.message); }
      }));
    }
  };
}
