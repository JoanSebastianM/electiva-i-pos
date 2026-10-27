import SqliteRepository from './SqliteRepository.js';

export default class CategoryRepository extends SqliteRepository {
  constructor() {
    super({ table: 'Category', columns: ['name'], orderBy: 'name' });
  }
}
