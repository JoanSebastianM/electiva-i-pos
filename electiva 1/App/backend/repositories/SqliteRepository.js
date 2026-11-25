import Repository from './Repository.js';
import { getDb } from '../db.js';

/**
 * Implementación base del contrato Repository para SQLite (SQLiteRepository<T> acorde al diagrama).
 * Las subclases solo configuran la tabla, las columnas y las consultas propias.
 */
export default class SQLiteRepository extends Repository {
  constructor({ table, columns, orderBy = 'id', searchColumns = [] } = {}) {
    super();
    if (!table) throw new Error('SQLiteRepository requiere una tabla');
    this.table = table;
    this.columns = columns || [];
    this.orderBy = orderBy;
    this.searchColumns = searchColumns;
  }

  get db() {
    return getDb();
  }

  findAll({ search } = {}) {
    if (search && this.searchColumns.length > 0) {
      const conditions = this.searchColumns.map((column) => `${column} LIKE ?`).join(' OR ');
      const params = this.searchColumns.map(() => `%${search}%`);
      return this.db
        .prepare(`SELECT * FROM ${this.table} WHERE ${conditions} ORDER BY ${this.orderBy}`)
        .all(...params);
    }

    return this.db.prepare(`SELECT * FROM ${this.table} ORDER BY ${this.orderBy}`).all();
  }

  findById(id) {
    return this.db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id);
  }

  create(data = {}) {
    const columns = this.columns.filter((column) => data[column] !== undefined);
    if (columns.length === 0) {
      const info = this.db.prepare(`INSERT INTO ${this.table} DEFAULT VALUES`).run();
      return this.findById(info.lastInsertRowid);
    }
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((column) => data[column]);

    const info = this.db
      .prepare(`INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`)
      .run(...values);

    return this.findById(info.lastInsertRowid);
  }

  update(id, data = {}) {
    const columns = this.columns.filter((column) => data[column] !== undefined);
    if (columns.length === 0) return this.findById(id);

    const assignments = columns.map((column) => `${column} = ?`).join(', ');
    const values = columns.map((column) => data[column]);

    const info = this.db
      .prepare(`UPDATE ${this.table} SET ${assignments} WHERE id = ?`)
      .run(...values, id);

    return info.changes === 0 ? null : this.findById(id);
  }

  delete(id) {
    return this.db.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(id);
  }
}
