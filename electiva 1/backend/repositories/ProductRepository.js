import SQLiteRepository from './SqliteRepository.js';

const listSql = `
  SELECT p.id, p.name, p.price, p.stock, p.categoryId, c.name AS categoryName
  FROM Product p
  LEFT JOIN Category c ON c.id = p.categoryId
`;

const orderSql = {
  price_asc: 'p.price ASC, p.name ASC',
  price_desc: 'p.price DESC, p.name ASC',
  name_asc: 'p.name ASC',
  name_desc: 'p.name DESC'
};

export default class ProductRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'Product',
      columns: ['name', 'categoryId', 'price', 'stock'],
      orderBy: 'name'
    });
  }

  findAll({ search, order } = {}) {
    const clause = orderSql[order] || orderSql.name_asc;
    if (search) {
      return this.db
        .prepare(`${listSql} WHERE p.name LIKE ? ORDER BY ${clause}`)
        .all(`%${search}%`);
    }

    return this.db.prepare(`${listSql} ORDER BY ${clause}`).all();
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
    return this.db.prepare('UPDATE Product SET stock = stock + ? WHERE id = ?').run(Number(quantity), id);
  }
}
