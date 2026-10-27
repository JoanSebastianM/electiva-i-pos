import SqliteRepository from './SqliteRepository.js';

export default class IngredientRepository extends SqliteRepository {
  constructor() {
    super({
      table: 'Ingredient',
      columns: ['name', 'unit', 'stock'],
      orderBy: 'name'
    });
  }
}
