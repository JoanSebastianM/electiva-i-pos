import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

let editing = null;

export async function renderCategories({ state, setMsg }) {
  const categories = await api.categories.list();
  const canAdmin = state?.user?.role === 'admin';
  const current = editing ? categories.find((item) => item.id === editing) : null;
  if (editing && !current) editing = null;

  const html = `<div class="grid ${canAdmin ? 'grid-2' : ''}">
    ${canAdmin ? `<div class="panel"><h3>${editing ? 'Editar' : 'Nueva'} categoria</h3>
      <form id="categoryForm">
        <label>Nombre<input name="name" required value="${esc(current?.name || '')}"></label>
        <div class="row"><button class="btn primary" type="submit">${editing ? 'Actualizar' : 'Guardar'}</button>
        ${editing ? '<button class="btn" type="button" id="cancelCategoryEdit">Cancelar</button>' : ''}</div>
      </form></div>` : ''}
    <div class="panel"><h3>Categorias</h3><table><thead><tr><th>Nombre</th>${canAdmin ? '<th></th>' : ''}</tr></thead><tbody>
      ${categories.map((item) => `<tr><td>${esc(item.name)}</td>${canAdmin ? `<td class="row"><button class="btn" data-category-edit="${item.id}">Editar</button><button class="btn danger" data-category-del="${item.id}">Eliminar</button></td>` : ''}</tr>`).join('')}
    </tbody></table></div>
  </div>`;

  return {
    html,
    bind() {
      if (!canAdmin) return;
      document.getElementById('categoryForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(event.target);
        const payload = { name: String(fd.get('name') || '').trim() };
        try {
          if (editing) {
            await api.categories.update(editing, payload);
            editing = null;
            setMsg('Categoria actualizada');
          } else {
            await api.categories.create(payload);
            setMsg('Categoria guardada');
          }
        } catch (error) { setMsg('', error.message); }
      });
      document.getElementById('cancelCategoryEdit')?.addEventListener('click', () => { editing = null; setMsg('Edicion cancelada'); });
      document.querySelectorAll('[data-category-edit]').forEach((button) => button.addEventListener('click', () => {
        editing = Number(button.dataset.categoryEdit);
        setMsg('Editando categoria');
      }));
      document.querySelectorAll('[data-category-del]').forEach((button) => button.addEventListener('click', async () => {
        if (!confirm('Eliminar categoria?')) return;
        try {
          await api.categories.remove(button.dataset.categoryDel);
          if (String(editing) === button.dataset.categoryDel) editing = null;
          setMsg('Categoria eliminada');
        } catch (error) { setMsg('', error.message); }
      }));
    }
  };
}
