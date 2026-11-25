import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

let editing = null;

export async function renderIngredients({ state, setMsg }) {
  const ingredients = await api.ingredients.list();
  const canAdmin = state?.user?.role === 'admin';
  const current = editing ? ingredients.find((item) => item.id === editing) : null;
  if (editing && !current) editing = null;

  const html = `<div class="grid ${canAdmin ? 'grid-2' : ''}">
    ${canAdmin ? `<div class="panel"><h3>${editing ? 'Editar' : 'Nuevo'} ingrediente</h3>
      <form id="ingredientForm">
        <label>Nombre<input name="name" required value="${esc(current?.name || '')}"></label>
        <label>Unidad<input name="unit" required value="${esc(current?.unit || 'g')}"></label>
        <label>Stock<input name="stock" type="number" min="0" step="0.01" required value="${current?.stock ?? 0}"></label>
        <div class="row"><button class="btn primary" type="submit">${editing ? 'Actualizar' : 'Guardar'}</button>
        ${editing ? '<button class="btn" type="button" id="cancelIngredientEdit">Cancelar</button>' : ''}</div>
      </form></div>` : ''}
    <div class="panel"><h3>Ingredientes</h3><table><thead><tr><th>Nombre</th><th>Unidad</th><th>Stock</th>${canAdmin ? '<th></th>' : ''}</tr></thead><tbody>
      ${ingredients.map((item) => `<tr><td>${esc(item.name)}</td><td>${esc(item.unit)}</td><td>${item.stock}</td>${canAdmin ? `<td class="row"><button class="btn" data-ingredient-edit="${item.id}">Editar</button><button class="btn danger" data-ingredient-del="${item.id}">Eliminar</button></td>` : ''}</tr>`).join('')}
    </tbody></table></div>
  </div>`;

  return {
    html,
    bind() {
      if (!canAdmin) return;
      document.getElementById('ingredientForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(event.target);
        const payload = {
          name: String(fd.get('name') || '').trim(),
          unit: String(fd.get('unit') || '').trim(),
          stock: Number(fd.get('stock'))
        };
        try {
          if (editing) {
            await api.ingredients.update(editing, payload);
            editing = null;
            setMsg('Ingrediente actualizado');
          } else {
            await api.ingredients.create(payload);
            setMsg('Ingrediente guardado');
          }
        } catch (error) { setMsg('', error.message); }
      });
      document.getElementById('cancelIngredientEdit')?.addEventListener('click', () => { editing = null; setMsg('Edicion cancelada'); });
      document.querySelectorAll('[data-ingredient-edit]').forEach((button) => button.addEventListener('click', () => {
        editing = Number(button.dataset.ingredientEdit);
        setMsg('Editando ingrediente');
      }));
      document.querySelectorAll('[data-ingredient-del]').forEach((button) => button.addEventListener('click', async () => {
        if (!confirm('Eliminar ingrediente?')) return;
        try {
          await api.ingredients.remove(button.dataset.ingredientDel);
          if (String(editing) === button.dataset.ingredientDel) editing = null;
          setMsg('Ingrediente eliminado');
        } catch (error) { setMsg('', error.message); }
      }));
    }
  };
}
