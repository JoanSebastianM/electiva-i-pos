import { NotFoundError, ValidationError } from '../errors/AppError.js';

/** Convierte un elemento o una colección en una lista para procesar productos de una venta. */
function convertToList(items) {
  if (Array.isArray(items)) return items;
  if (items && typeof items === 'object') return [items];
  return [];
}

/** Administra el registro, consulta y eliminación de ventas. */
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

  /** Lista las ventas y adjunta a cada una los productos que contiene. */
  listSales() {
    const sales = this.sales.findAll();
    if (sales.length === 0) return [];

    const saleItems = this.saleItems.findBySaleIds(sales.map((sale) => sale.id));
    const saleItemsBySaleId = new Map();

    for (const saleItem of saleItems) {
      const groupedItems = saleItemsBySaleId.get(saleItem.saleId) || [];
      groupedItems.push(saleItem);
      saleItemsBySaleId.set(saleItem.saleId, groupedItems);
    }

    return sales.map((sale) =>
      this.buildSaleWithItems(sale, saleItemsBySaleId.get(sale.id) || [])
    );
  }

  /** Busca una venta por su ID y devuelve también los productos asociados. */
  getSaleById(saleId) {
    const sale = this.sales.findById(saleId);
    if (!sale) throw new NotFoundError('Venta no encontrada');
    return this.buildSaleWithItems(sale);
  }

  /** Construye la respuesta de una venta incluyendo sus artículos y datos principales. */
  buildSaleWithItems(sale, saleItems = this.saleItems.findBySaleId(sale.id)) {
    const firstSaleItem = saleItems[0] || {};

    return {
      ...sale,
      items: saleItems,
      productId: firstSaleItem.productId ?? sale.productId,
      quantity: firstSaleItem.quantity ?? sale.quantity,
      unitPrice: firstSaleItem.unitPrice ?? sale.unitPrice,
      productName: firstSaleItem.productName ?? sale.productName
    };
  }

  /** Valida y normaliza los productos y cantidades recibidos para registrar una venta. */
  normalizeSaleItems(saleData) {
    const rawSaleItems = Array.isArray(saleData)
      ? saleData
      : saleData?.items ??
        saleData?.saleItems ??
        (saleData?.productId || saleData?.product ? saleData : null);
    const saleItems = convertToList(rawSaleItems);

    if (saleItems.length === 0) {
      throw new ValidationError('Debes indicar al menos un producto');
    }

    return saleItems.map((saleItem) => {
      const productId = saleItem.productId ?? saleItem.product?.id;
      const productQuantity = saleItem.quantity;

      if (!productId || isNaN(Number(productId))) {
        throw new ValidationError('Debes indicar el producto');
      }
      if (
        productQuantity == null ||
        !Number.isInteger(Number(productQuantity)) ||
        Number(productQuantity) < 1
      ) {
        throw new ValidationError('La cantidad debe ser un entero mayor o igual a 1');
      }

      return {
        productId: Number(productId),
        quantity: Number(productQuantity)
      };
    });
  }

  /** Registra una venta completa y descuenta el inventario dentro de una transacción. */
  registerSale(saleData = {}) {
    const normalizedSaleItems = this.normalizeSaleItems(saleData);
    const customerId = saleData?.customerId ?? saleData?.customer?.id ?? null;

    return this.transaction(() => {
      const preparedSaleItems = normalizedSaleItems.map((saleItem) => {
        const product = this.inventory.getProductById(saleItem.productId);
        const unitPrice = Number(product.price);
        const subtotal = unitPrice * saleItem.quantity;

        return {
          product,
          quantity: saleItem.quantity,
          unitPrice,
          subtotal
        };
      });

      const total = preparedSaleItems.reduce(
        (saleTotal, saleItem) => saleTotal + saleItem.subtotal,
        0
      );
      const sale = this.sales.create({ customerId, total });
      if (!sale) throw new ValidationError('No se pudo registrar la venta');

      for (const saleItem of preparedSaleItems) {
        this.saleItems.create({
          saleId: sale.id,
          productId: saleItem.product.id,
          quantity: saleItem.quantity,
          unitPrice: saleItem.unitPrice,
          subtotal: saleItem.subtotal
        });

        this.inventory.deductInventoryForSale(saleItem.product, saleItem.quantity);
      }

      return this.getSaleById(sale.id);
    });
  }

  /** Elimina una venta y devuelve al inventario los productos e ingredientes consumidos. */
  deleteSaleById(saleId) {
    return this.transaction(() => {
      const sale = this.sales.findById(saleId);
      if (!sale) throw new NotFoundError('Venta no encontrada');

      const saleItems = this.saleItems.findBySaleId(saleId);
      const itemsToRestore = saleItems.length > 0
        ? saleItems
        : this.getLegacyItemsForSale(sale);

      this.sales.delete(saleId);

      for (const saleItem of itemsToRestore) {
        const productId = saleItem.productId ?? saleItem.product?.id;
        if (productId && saleItem.quantity) {
          this.inventory.restoreInventoryForSale(productId, saleItem.quantity);
        }
      }

      return { deleted: true, id: Number(saleId) };
    });
  }

  /** Recupera los datos de producto de ventas antiguas que no tienen detalle separado. */
  getLegacyItemsForSale(sale) {
    return sale.productId && sale.quantity
      ? [{ productId: sale.productId, quantity: sale.quantity }]
      : [];
  }

  // Adaptadores temporales para conservar el contrato de las rutas actuales de ventas.
  list() {
    return this.listSales();
  }

  get(saleId) {
    return this.getSaleById(saleId);
  }

  remove(saleId) {
    return this.deleteSaleById(saleId);
  }
}
