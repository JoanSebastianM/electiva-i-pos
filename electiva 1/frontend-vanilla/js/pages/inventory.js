import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

export async function renderInventory({ state, setMsg }) {
  const canAdmin = state?.user?.role === 'admin';
  const items = await api.inventory.list();
  return {
    html: `<div class="panel"><h3>Inventario</h3><table><thead><tr><th>Producto</th><th>Stock</th><th>Estado</th>${canAdmin ? '<th>Ajuste</th>' : ''}</tr></thead><tbody>
      ${items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.stock}</td><td>${Number(i.stock) <= 5 ? '<span style="color:#b45309;font-weight:700">Bajo</span>' : '<span style="color:#059669;font-weight:700">OK</span>'}</td>
      ${canAdmin ? `<td class="row"><input id="stock-${i.id}" type="number" min="0" value="${i.stock}" style="width:110px"><button class="btn" data-save-stock="${i.id}">Guardar</button></td>` : ''}</tr>`).join('')}
    </tbody></table></div>`,
    bind() {
      if (!canAdmin) return;
      document.querySelectorAll('[data-save-stock]').forEach((btn) => btn.addEventListener('click', async () => {
        const id = btn.dataset.saveStock;
        const stock = Number(document.getElementById(`stock-${id}`).value);
        try { await api.inventory.update(id, { stock }); setMsg('Inventario actualizado'); }
        catch (e) { setMsg('', e.message); }
      }));
    }
  };
}
