import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

let selectedProductId = null;

export async function renderRecipes({ state, setMsg }) {
  const [products, ingredients] = await Promise.all([api.products.list(), api.ingredients.list()]);
  const canAdmin = state?.user?.role === 'admin';
  if (!selectedProductId || !products.some((product) => product.id === selectedProductId)) {
    selectedProductId = products[0]?.id ?? null;
  }

  const recipe = selectedProductId ? await api.recipes.list(selectedProductId) : [];
  const recipeMap = new Map(recipe.map((item) => [Number(item.ingredientId), Number(item.quantity)]));

  const html = `<div class="panel">
    <h3>Recetas de productos</h3>
    <label>Producto<select id="recipeProduct"><option value="">Selecciona producto</option>${products.map((product) => `<option value="${product.id}" ${String(product.id) === String(selectedProductId) ? 'selected' : ''}>${esc(product.name)}</option>`).join('')}</select></label>
    ${!selectedProductId ? '<div class="msg error">No hay productos disponibles.</div>' : ''}
    ${canAdmin && selectedProductId ? `<form id="recipeForm"><table><thead><tr><th>Ingrediente</th><th>Unidad</th><th>Cantidad</th></tr></thead><tbody>
      ${ingredients.map((ingredient) => `<tr><td>${esc(ingredient.name)}</td><td>${esc(ingredient.unit)}</td><td><input type="number" min="0" step="0.01" data-recipe-qty="${ingredient.id}" value="${recipeMap.get(Number(ingredient.id)) ?? 0}"></td></tr>`).join('')}
    </tbody></table><div class="row" style="margin-top:12px"><button class="btn primary" type="submit">Guardar receta</button></div></form>` : ''}
    ${!canAdmin && selectedProductId ? `<table><thead><tr><th>Ingrediente</th><th>Unidad</th><th>Cantidad</th></tr></thead><tbody>
      ${recipe.length ? recipe.map((item) => `<tr><td>${esc(item.ingredientName || item.ingredientId)}</td><td>${esc(item.unit || '-')}</td><td>${item.quantity}</td></tr>`).join('') : '<tr><td colspan="3" class="muted">Sin receta asignada</td></tr>'}
    </tbody></table>` : ''}
  </div>`;

  return {
    html,
    bind() {
      document.getElementById('recipeProduct')?.addEventListener('change', (event) => {
        selectedProductId = event.target.value ? Number(event.target.value) : null;
        setMsg('Receta cargada');
      });
      document.getElementById('recipeForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const items = [...document.querySelectorAll('[data-recipe-qty]')]
          .map((input) => ({ ingredientId: Number(input.dataset.recipeQty), quantity: Number(input.value) }))
          .filter((item) => item.quantity > 0);
        try {
          await api.recipes.replace(selectedProductId, items);
          setMsg('Receta guardada');
        } catch (error) { setMsg('', error.message); }
      });
    }
  };
}
