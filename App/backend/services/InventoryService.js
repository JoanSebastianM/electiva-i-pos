import { NotFoundError, ValidationError } from '../errors/AppError.js';

/**
 * Administra las reglas de inventario utilizadas al registrar o eliminar ventas:
 * valida existencias, calcula consumo de ingredientes y repone el inventario.
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

  /** Obtiene un producto por su ID o informa que no existe. */
  getProductById(productId) {
    const product = this.products?.findById
      ? this.products.findById(Number(productId))
      : null;

    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }

  /** Comprueba que el producto tenga unidades suficientes para la venta. */
  validateProductStockAvailability(product, productQuantity) {
    if (Number(productQuantity) > Number(product.stock)) {
      throw new ValidationError(
        `Stock insuficiente: solo hay ${product.stock} unidades de "${product.name}"`
      );
    }
  }

  /** Calcula cuántas unidades de cada ingrediente consume la cantidad de productos indicada. */
  calculateIngredientRequirementsForProduct(product, productQuantity) {
    const normalizedProductQuantity = Number(productQuantity || 0);
    if (!product || !this.recipes?.findByProductId) return [];

    return this.recipes.findByProductId(product.id).map((recipeItem) => ({
      ingredientId: recipeItem.ingredientId,
      quantity: Number(recipeItem.quantity || 0) * normalizedProductQuantity
    }));
  }

  /** Verifica que existan todos los ingredientes y que sus cantidades alcancen para la venta. */
  validateIngredientStockAvailability(ingredientRequirements) {
    for (const ingredientRequirement of ingredientRequirements) {
      const ingredient = this.ingredients?.findById
        ? this.ingredients.findById(ingredientRequirement.ingredientId)
        : null;

      if (!ingredient) {
        throw new ValidationError(
          `El ingrediente ${ingredientRequirement.ingredientId} no existe`
        );
      }

      if (ingredientRequirement.quantity > Number(ingredient.stock)) {
        throw new ValidationError(
          `Stock insuficiente del ingrediente "${ingredient.name}": ` +
            `se requieren ${ingredientRequirement.quantity} ${ingredient.unit} y hay ${ingredient.stock}`
        );
      }
    }
  }

  /** Descuenta del inventario las cantidades de ingredientes consumidas. */
  deductIngredientStock(ingredientRequirements) {
    for (const ingredientRequirement of ingredientRequirements) {
      const updateResult = this.ingredients.decrementStock(
        ingredientRequirement.ingredientId,
        ingredientRequirement.quantity
      );

      if (updateResult && updateResult.changes === 0) {
        throw new ValidationError(
          'No hay stock suficiente de ingredientes para completar la venta'
        );
      }
    }
  }

  /** Repone las cantidades de ingredientes asociadas a una venta eliminada. */
  restoreIngredientStock(ingredientRequirements) {
    for (const ingredientRequirement of ingredientRequirements) {
      this.ingredients.incrementStock(
        ingredientRequirement.ingredientId,
        ingredientRequirement.quantity
      );
    }
  }

  /** Valida y descuenta el producto y los ingredientes necesarios para una venta. */
  deductInventoryForSale(product, productQuantity) {
    const normalizedProductQuantity = Number(productQuantity || 0);

    this.validateProductStockAvailability(product, normalizedProductQuantity);

    const ingredientRequirements = this.calculateIngredientRequirementsForProduct(
      product,
      normalizedProductQuantity
    );
    this.validateIngredientStockAvailability(ingredientRequirements);

    const updateResult = this.products.decrementStock(product.id, normalizedProductQuantity);
    if (updateResult && updateResult.changes === 0) {
      throw new ValidationError('No hay stock suficiente para completar la venta');
    }

    this.deductIngredientStock(ingredientRequirements);
    return true;
  }

  /** Restaura el producto y sus ingredientes cuando se elimina una venta. */
  restoreInventoryForSale(productId, productQuantity) {
    const product = this.products?.findById
      ? this.products.findById(Number(productId))
      : null;
    if (!product) return;

    const normalizedProductQuantity = Number(productQuantity || 0);
    this.products.incrementStock(product.id, normalizedProductQuantity);

    const ingredientRequirements = this.calculateIngredientRequirementsForProduct(
      product,
      normalizedProductQuantity
    );
    this.restoreIngredientStock(ingredientRequirements);
  }
}
