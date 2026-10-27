import SqliteRepository from './SqliteRepository.js';

export default class CustomerRepository extends SqliteRepository {
  constructor() {
    super({
      table: 'Customer',
      columns: ['name', 'phone'],
      orderBy: 'name',
      searchColumns: ['name', 'phone']
    });
  }
}
