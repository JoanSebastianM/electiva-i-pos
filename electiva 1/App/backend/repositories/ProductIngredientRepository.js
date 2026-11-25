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
}
