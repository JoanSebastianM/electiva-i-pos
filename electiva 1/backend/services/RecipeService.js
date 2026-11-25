import { NotFoundError, ValidationError } from '../errors/AppError.js';

export default class RecipeService {
  constructor({ recipes, ingredients, products, transaction } = {}) {
    if (!recipes) throw new Error('RecipeService requiere recipes');
    if (!ingredients) throw new Error('RecipeService requiere ingredients');
    if (!products) throw new Error('RecipeService requiere products');
    if (!transaction) throw new Error('RecipeService requiere transaction');
    this.recipes = recipes;
    this.ingredients = ingredients;
    this.products = products;
    this.transaction = transaction;
  }

  list(productId) {
    this.getProduct(productId);
    return this.recipes.findDetailedByProductId(Number(productId));
  }

  replace(productId, data = {}) {
    const product = this.getProduct(productId);
    const items = this.normalizeItems(data.items);

    for (const item of items) {
      const ingredient = this.ingredients.findById(item.ingredientId);
      if (!ingredient) throw new ValidationError(`El ingrediente ${item.ingredientId} no existe`);
    }

    return this.transaction(() => {
      this.recipes.deleteByProductId(product.id);
      for (const item of items) {
        this.recipes.create({
          productId: product.id,
          ingredientId: item.ingredientId,
          quantity: item.quantity
        });
      }
      return this.list(product.id);
    });
  }

  getProduct(productId) {
    const product = this.products.findById(Number(productId));
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }

  normalizeItems(items) {
    if (!Array.isArray(items)) throw new ValidationError('La receta debe tener una lista de ingredientes');

    const seen = new Set();
    return items.map((item) => {
      const ingredientId = Number(item?.ingredientId);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(ingredientId) || ingredientId < 1) {
        throw new ValidationError('IngredientId invalido');
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new ValidationError('La cantidad del ingrediente debe ser mayor a 0');
      }
      if (seen.has(ingredientId)) {
        throw new ValidationError('El ingrediente esta repetido en la receta');
      }
      seen.add(ingredientId);
      return { ingredientId, quantity };
    });
  }
}
