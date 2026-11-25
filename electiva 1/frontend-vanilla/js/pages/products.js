import { api } from '../api/client.js';
import { esc, formatMoney } from '../utils/format.js';

let editing = null;

export async function renderProducts({ state, setMsg, rerender }) {
  const canAdmin = state?.user?.role === 'admin';
  const order = state.productOrder || '';
  const [products, categories] = await Promise.all([api.products.list(order ? `order=${encodeURIComponent(order)}` : ''), api.categories.list()]);
  const current = editing ? products.find((p) => p.id === editing) : null;
  if (editing && !current) editing = null;

  const html = `<div class="grid ${canAdmin ? 'grid-2' : ''}">
    ${canAdmin ? `<div class="panel"><h3>${editing ? 'Editar' : 'Nuevo'} producto</h3>
      <form id="productForm"><label>Nombre<input name="name" required value="${esc(current?.name || '')}"></label>
      <label>Categoria<select name="categoryId"><option value="">Sin categoria</option>${categories.map((c) => `<option value="${c.id}" ${String(current?.categoryId || '') === String(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label>Precio<input name="price" type="number" min="0" required value="${current?.price ?? ''}"></label>
      <label>Stock<input name="stock" type="number" min="0" required value="${current?.stock ?? ''}"></label>
      <div class="row"><button class="btn primary" type="submit">${editing ? 'Actualizar' : 'Guardar'}</button>${editing ? '<button class="btn" type="button" id="cancelEdit">Cancelar</button>' : ''}</div></form></div>` : ''}
      <div class="panel"><h3>Productos</h3><div class="row"><label>Orden<select id="productOrder"><option value="" ${order === '' ? 'selected' : ''}>Nombre</option><option value="price_asc" ${order === 'price_asc' ? 'selected' : ''}>Precio: menor a mayor</option><option value="price_desc" ${order === 'price_desc' ? 'selected' : ''}>Precio: mayor a menor</option></select></label></div><table><thead><tr><th>Nombre</th><th>Categoria</th><th>Precio</th><th>Stock</th>${canAdmin ? '<th></th>' : ''}</tr></thead><tbody>
      ${products.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.categoryName || '-')}</td><td>${formatMoney(p.price)}</td><td>${p.stock}</td>${canAdmin ? `<td class="row"><button class="btn" data-edit="${p.id}">Editar</button><button class="btn danger" data-del="${p.id}">Eliminar</button></td>` : ''}</tr>`).join('')}
      </tbody></table></div></div>`;

  return {
    html,
    bind() {
      document.getElementById('productOrder')?.addEventListener('change', (e) => {
        state.productOrder = e.target.value;
        void rerender();
      });
      if (!canAdmin) return;
      document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
          name: String(fd.get('name') || '').trim(),
          categoryId: fd.get('categoryId') ? Number(fd.get('categoryId')) : null,
          price: Number(fd.get('price')),
          stock: Number(fd.get('stock'))
        };
        try {
          if (editing) {
            await api.products.update(editing, payload);
            editing = null;
            setMsg('Producto actualizado');
          } else {
            await api.products.create(payload);
            setMsg('Producto guardado');
          }
        } catch (err) { setMsg('', err.message); }
      });
      document.getElementById('cancelEdit')?.addEventListener('click', () => { editing = null; setMsg('Edicion cancelada'); });
      document.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => { editing = Number(b.dataset.edit); setMsg('Editando producto'); }));
      document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('Eliminar producto?')) return;
        try { await api.products.remove(b.dataset.del); if (String(editing) === b.dataset.del) editing = null; setMsg('Producto eliminado'); }
        catch (err) { setMsg('', err.message); }
      }));
    }
  };
}
