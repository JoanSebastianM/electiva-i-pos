import SQLiteRepository from './SqliteRepository.js';

export default class UserRepository extends SQLiteRepository {
  constructor() {
    super({
      table: 'User',
      columns: ['username', 'password', 'name', 'role', 'active'],
      orderBy: 'id DESC',
      searchColumns: ['username', 'name', 'role']
    });
  }

  findAll(options = {}) {
    const rows = super.findAll(options);
    return rows.map(({ password, ...user }) => user);
  }

  findById(id) {
    const row = super.findById(id);
    if (!row) return null;
    const { password, ...user } = row;
    return user;
  }

  findAuthByUsername(username) {
    return this.db.prepare('SELECT * FROM User WHERE username = ?').get(username);
  }

  findWithPasswordById(id) {
    return this.db.prepare('SELECT * FROM User WHERE id = ?').get(id);
  }

  delete(id) {
    return this.db.transaction(() => {
      this.db.prepare('UPDATE Sale SET userId = NULL WHERE userId = ?').run(id);
      this.db.prepare('DELETE FROM Session WHERE userId = ?').run(id);
      return this.db.prepare('DELETE FROM User WHERE id = ?').run(id);
    })();
  }
}
