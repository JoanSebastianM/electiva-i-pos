import { ValidationError } from '../errors/AppError.js';

/**
 * Encapsula las reglas de inventario usadas por el modulo de ventas.
 */
export default class InventoryService {
  constructor(productRepository) {
    this.products = productRepository;
  }

  getProduct(productId) {
    const product = this.products.findById(Number(productId));
    if (!product) throw new ValidationError('El producto no existe');
    return product;
  }

  assertAvailable(product, quantity) {
    if (quantity > product.stock) {
      throw new ValidationError(
        `Stock insuficiente: solo hay ${product.stock} unidades de "${product.name}"`
      );
    }
  }

  applySale(productId, quantity) {
    const info = this.products.decrementStock(productId, quantity);
    if (info.changes === 0) {
      throw new ValidationError('No hay stock suficiente para completar la venta');
    }
  }

  revertSale(productId, quantity) {
    this.products.incrementStock(productId, quantity);
  }
}
