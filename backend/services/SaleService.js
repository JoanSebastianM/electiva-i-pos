import { ValidationError, NotFoundError } from '../errors/AppError.js';
import { transaction } from '../db.js';

export default class SaleService {
  constructor(saleRepository, inventoryService) {
    this.sales = saleRepository;
    this.inventory = inventoryService;
  }

  list() {
    return this.sales.findAll();
  }

  get(id) {
    const sale = this.sales.findById(id);
    if (!sale) throw new NotFoundError('Venta no encontrada');
    return sale;
  }

  create(data = {}) {
    const { productId, quantity } = data;

    if (!productId || isNaN(Number(productId))) {
      throw new ValidationError('Debes indicar el producto');
    }
    if (quantity == null || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      throw new ValidationError('La cantidad debe ser un entero mayor o igual a 1');
    }

    const qty = Number(quantity);

    return transaction(() => {
      const product = this.inventory.getProduct(productId);
      this.inventory.assertAvailable(product, qty);

      const unitPrice = Number(product.price);
      const total = qty * unitPrice;

      const sale = this.sales.create({
        productId: product.id,
        quantity: qty,
        unitPrice,
        total
      });

      this.inventory.applySale(product.id, qty);
      return this.sales.findById(sale.id);
    });
  }

  remove(id) {
    return transaction(() => {
      const sale = this.sales.findById(id);
      if (!sale) throw new NotFoundError('Venta no encontrada');

      this.sales.delete(id);
      this.inventory.revertSale(sale.productId, sale.quantity);

      return { deleted: true, id: Number(id) };
    });
  }
}
