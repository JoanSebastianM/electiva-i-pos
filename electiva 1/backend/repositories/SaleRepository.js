import SQLiteRepository from './SqliteRepository.js';

export default class SaleRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'Sale',
      columns: ['customerId', 'userId', 'total'],
      orderBy: 'id DESC'
    });
  }

  findAll() {
    return this.db
      .prepare(
        `SELECT s.id, s.customerId, s.userId, s.total, s.createdAt,
                c.name AS customerName, u.username AS seller
         FROM Sale s
         LEFT JOIN Customer c ON c.id = s.customerId
         LEFT JOIN User u ON u.id = s.userId
         ORDER BY s.id DESC`
      )
      .all();
  }

  findById(id) {
    return this.db
      .prepare(
        `SELECT s.id, s.customerId, s.userId, s.total, s.createdAt,
                c.name AS customerName, u.username AS seller
         FROM Sale s
         LEFT JOIN Customer c ON c.id = s.customerId
         LEFT JOIN User u ON u.id = s.userId
         WHERE s.id = ?`
      )
      .get(id);
  }
}
