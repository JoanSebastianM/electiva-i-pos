import { NotFoundError, ValidationError } from '../errors/AppError.js';

/**
 * Encapsula las reglas de inventario usadas por el módulo de ventas:
 * disponibilidad de productos, consumo de ingredientes según la receta
 * y restauración de existencias al eliminar una venta.
 */
export default class InventoryService {
  constructor({ products, ingredients, recipes } = {}) {
    if (!products) throw new Error('InventoryService requiere products');
    if (!ingredients) throw new Error('InventoryService requiere ingredients');
    if (!recipes) throw new Error('InventoryService requiere recipes');

    this.products = products;
    this.ingredients = ingredients;
    this.recipes = recipes;
  }

  getProduct(productId) {
    const product = this.products?.findById ? this.products.findById(Number(productId)) : null;
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }

  assertAvailable(product, quantity) {
    if (Number(quantity) > Number(product.stock)) {
      throw new ValidationError(
        `Stock insuficiente: solo hay ${product.stock} unidades de "${product.name}"`
      );
    }
  }

  calculateRequiredIngredients(product, units) {
    const quantity = Number(units || 0);
    if (!product || !this.recipes?.findByProductId) return [];

    return this.recipes.findByProductId(product.id).map((item) => ({
      ingredientId: item.ingredientId,
      quantity: Number(item.quantity || 0) * quantity
    }));
  }

  assertIngredientsAvailable(requirements) {
    for (const requirement of requirements) {
      const ingredient = this.ingredients?.findById
        ? this.ingredients.findById(requirement.ingredientId)
        : null;
      if (!ingredient) {
        throw new ValidationError(`El ingrediente ${requirement.ingredientId} no existe`);
      }
      if (requirement.quantity > Number(ingredient.stock)) {
        throw new ValidationError(
          `Stock insuficiente del ingrediente "${ingredient.name}": ` +
            `se requieren ${requirement.quantity} ${ingredient.unit} y hay ${ingredient.stock}`
        );
      }
    }
  }

  deductIngredients(requirements) {
    for (const requirement of requirements) {
      const info = this.ingredients.decrementStock(requirement.ingredientId, requirement.quantity);
      if (info && info.changes === 0) {
        throw new ValidationError('No hay stock suficiente de ingredientes para completar la venta');
      }
    }
  }

  restoreIngredients(requirements) {
    for (const requirement of requirements) {
      this.ingredients.incrementStock(requirement.ingredientId, requirement.quantity);
    }
  }

  deductStockForSale(product, units) {
    const quantity = Number(units || 0);
    this.assertAvailable(product, quantity);

    const requirements = this.calculateRequiredIngredients(product, quantity);
    this.assertIngredientsAvailable(requirements);

    const info = this.products.decrementStock(product.id, quantity);
    if (info && info.changes === 0) {
      throw new ValidationError('No hay stock suficiente para completar la venta');
    }

    this.deductIngredients(requirements);
    return true;
  }

  restoreStockForSale(productId, units) {
    const product = this.products?.findById ? this.products.findById(Number(productId)) : null;
    if (!product) return;

    const quantity = Number(units || 0);
    this.products.incrementStock(product.id, quantity);
    this.restoreIngredients(this.calculateRequiredIngredients(product, quantity));
  }
}
