import SqliteRepository from './SqliteRepository.js';

const listSql = `
  SELECT p.id, p.name, p.price, p.stock, p.categoryId, c.name AS categoryName
  FROM Product p
  LEFT JOIN Category c ON c.id = p.categoryId
`;

export default class ProductRepository extends SqliteRepository {
  constructor() {
    super({
      table: 'Product',
      columns: ['name', 'categoryId', 'price', 'stock'],
      orderBy: 'name'
    });
  }

  findAll({ search } = {}) {
    if (search) {
      return this.db
        .prepare(`${listSql} WHERE p.name LIKE ? ORDER BY p.name`)
        .all(`%${search}%`);
    }

    return this.db.prepare(`${listSql} ORDER BY p.name`).all();
  }

  findById(id) {
    return this.db.prepare(`${listSql} WHERE p.id = ?`).get(id);
  }

  decrementStock(id, quantity) {
    return this.db
      .prepare('UPDATE Product SET stock = stock - ? WHERE id = ? AND stock >= ?')
      .run(Number(quantity), id, Number(quantity));
  }

  incrementStock(id, quantity) {
    return this.db
      .prepare('UPDATE Product SET stock = stock + ? WHERE id = ?')
      .run(Number(quantity), id);
  }
}
