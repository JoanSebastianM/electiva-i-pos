import SqliteRepository from './SqliteRepository.js';

const listSql = `
  SELECT s.id, s.productId, s.quantity, s.unitPrice, s.total, s.createdAt,
         p.name AS productName
  FROM Sale s
  JOIN Product p ON p.id = s.productId
`;

export default class SaleRepository extends SqliteRepository {
  constructor() {
    super({
      table: 'Sale',
      columns: ['productId', 'quantity', 'unitPrice', 'total'],
      orderBy: 'id'
    });
  }

  findAll() {
    return this.db.prepare(`${listSql} ORDER BY s.id DESC`).all();
  }

  findById(id) {
    return this.db.prepare(`${listSql} WHERE s.id = ?`).get(id);
  }
}
