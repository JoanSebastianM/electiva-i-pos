import SQLiteRepository from './SqliteRepository.js';

export default class SaleRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'Sale',
      columns: ['customerId', 'total'],
      orderBy: 'id DESC'
    });
  }

  findAll() {
    return this.db
      .prepare(
        `SELECT s.id, s.customerId, s.total, s.createdAt,
                c.name AS customerName
         FROM Sale s
         LEFT JOIN Customer c ON c.id = s.customerId
         ORDER BY s.id DESC`
      )
      .all();
  }

  findById(id) {
    return this.db
      .prepare(
        `SELECT s.id, s.customerId, s.total, s.createdAt,
                c.name AS customerName
         FROM Sale s
         LEFT JOIN Customer c ON c.id = s.customerId
         WHERE s.id = ?`
      )
      .get(id);
  }
}
