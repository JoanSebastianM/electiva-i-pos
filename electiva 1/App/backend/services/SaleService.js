import { NotFoundError, ValidationError } from '../errors/AppError.js';

function asList(items) {
  if (Array.isArray(items)) return items;
  if (items && typeof items === 'object') return [items];
  return [];
}

export default class SaleService {
  constructor({ sales, saleItems, inventory, transaction } = {}) {
    if (!sales) throw new Error('SaleService requiere sales');
    if (!saleItems) throw new Error('SaleService requiere saleItems');
    if (!inventory) throw new Error('SaleService requiere inventory');
    if (!transaction) throw new Error('SaleService requiere transaction');

    this.sales = sales;
    this.saleItems = saleItems;
    this.inventory = inventory;
    this.transaction = transaction;
  }

  list() {
    const sales = this.sales.findAll();
    if (sales.length === 0) return [];

    const items = this.saleItems.findBySaleIds(sales.map((sale) => sale.id));
    const itemsBySale = new Map();

    for (const item of items) {
      const group = itemsBySale.get(item.saleId) || [];
      group.push(item);
      itemsBySale.set(item.saleId, group);
    }

    return sales.map((sale) => this.withItems(sale, itemsBySale.get(sale.id) || []));
  }

  get(id) {
    const sale = this.sales.findById(id);
    if (!sale) throw new NotFoundError('Venta no encontrada');
    return this.withItems(sale);
  }

  withItems(sale, items = this.saleItems.findBySaleId(sale.id)) {
    const first = items[0] || {};

    return {
      ...sale,
      items,
      productId: first.productId ?? sale.productId,
      quantity: first.quantity ?? sale.quantity,
      unitPrice: first.unitPrice ?? sale.unitPrice,
      productName: first.productName ?? sale.productName
    };
  }

  normalizeItems(input) {
    const rawItems = Array.isArray(input)
      ? input
      : input?.items ??
        input?.saleItems ??
        (input?.productId || input?.product ? input : null);
    const list = asList(rawItems);

    if (list.length === 0) {
      throw new ValidationError('Debes indicar al menos un producto');
    }

    return list.map((item) => {
      const productId = item.productId ?? item.product?.id;
      const quantity = item.quantity;

      if (!productId || isNaN(Number(productId))) {
        throw new ValidationError('Debes indicar el producto');
      }
      if (quantity == null || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new ValidationError('La cantidad debe ser un entero mayor o igual a 1');
      }

      return { productId: Number(productId), quantity: Number(quantity) };
    });
  }

  registerSale(input = {}) {
    const entries = this.normalizeItems(input);
    const customerId = input?.customerId ?? input?.customer?.id ?? null;

    return this.transaction(() => {
      const prepared = entries.map((entry) => {
        const product = this.inventory.getProduct(entry.productId);
        const unitPrice = Number(product.price);
        const subtotal = unitPrice * entry.quantity;
        return { product, quantity: entry.quantity, unitPrice, subtotal };
      });

      const total = prepared.reduce((sum, entry) => sum + entry.subtotal, 0);
      const sale = this.sales.create({ customerId, total });
      if (!sale) throw new ValidationError('No se pudo registrar la venta');

      for (const entry of prepared) {
        this.saleItems.create({
          saleId: sale.id,
          productId: entry.product.id,
          quantity: entry.quantity,
          unitPrice: entry.unitPrice,
          subtotal: entry.subtotal
        });
        this.inventory.deductStockForSale(entry.product, entry.quantity);
      }

      return this.get(sale.id);
    });
  }

  remove(id) {
    return this.transaction(() => {
      const sale = this.sales.findById(id);
      if (!sale) throw new NotFoundError('Venta no encontrada');

      const saleItems = this.saleItems.findBySaleId(id);
      const itemsToRestore = saleItems.length > 0 ? saleItems : this.legacyItems(sale);

      this.sales.delete(id);

      for (const item of itemsToRestore) {
        const productId = item.productId ?? item.product?.id;
        if (productId && item.quantity) {
          this.inventory.restoreStockForSale(productId, item.quantity);
        }
      }

      return { deleted: true, id: Number(id) };
    });
  }

  legacyItems(sale) {
    return sale.productId && sale.quantity
      ? [{ productId: sale.productId, quantity: sale.quantity }]
      : [];
  }
}
