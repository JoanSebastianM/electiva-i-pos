import SQLiteRepository from './SqliteRepository.js';

export default class IngredientRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'Ingredient',
      columns: ['name', 'unit', 'stock'],
      orderBy: 'name'
    });
  }

  decrementStock(id, quantity) {
    return this.db
      .prepare('UPDATE Ingredient SET stock = stock - ? WHERE id = ? AND stock >= ?')
      .run(Number(quantity), id, Number(quantity));
  }

  incrementStock(id, quantity) {
    return this.db.prepare('UPDATE Ingredient SET stock = stock + ? WHERE id = ?').run(Number(quantity), id);
  }
}
