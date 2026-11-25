import SQLiteRepository from './SqliteRepository.js';

const itemsSql = `
  SELECT si.id, si.saleId, si.productId, si.quantity, si.unitPrice, si.subtotal,
         p.name AS productName
  FROM SaleItem si
  LEFT JOIN Product p ON p.id = si.productId
`;

export default class SaleItemRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'SaleItem',
      columns: ['saleId', 'productId', 'quantity', 'unitPrice', 'subtotal'],
      orderBy: 'id'
    });
  }

  findBySaleId(saleId) {
    return this.db
      .prepare(`${itemsSql} WHERE si.saleId = ? ORDER BY si.id`)
      .all(saleId);
  }

  findBySaleIds(saleIds) {
    if (saleIds.length === 0) return [];

    const placeholders = saleIds.map(() => '?').join(', ');
    return this.db
      .prepare(`${itemsSql} WHERE si.saleId IN (${placeholders}) ORDER BY si.id`)
      .all(...saleIds);
  }
}
