import SQLiteRepository from './SqliteRepository.js';

export default class ProductIngredientRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'ProductIngredient',
      columns: ['productId', 'ingredientId', 'quantity'],
      orderBy: 'id'
    });
  }

  findByProductId(productId) {
    return this.db.prepare('SELECT * FROM ProductIngredient WHERE productId = ? ORDER BY id').all(productId);
  }

  findDetailedByProductId(productId) {
    return this.db
      .prepare(
        `SELECT pi.id, pi.productId, pi.ingredientId, pi.quantity,
                i.name AS ingredientName, i.unit AS unit
         FROM ProductIngredient pi
         LEFT JOIN Ingredient i ON i.id = pi.ingredientId
         WHERE pi.productId = ?
         ORDER BY pi.id`
      )
      .all(productId);
  }

  deleteByProductId(productId) {
    return this.db.prepare('DELETE FROM ProductIngredient WHERE productId = ?').run(productId);
  }
}
