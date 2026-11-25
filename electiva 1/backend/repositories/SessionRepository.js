import { getDb } from '../db.js';

export default class SessionRepository {
  constructor() {
    this.db = getDb();
  }

  create({ id, userId, expiresAt }) {
    this.db
      .prepare('INSERT INTO Session (id, userId, expiresAt) VALUES (?, ?, ?)')
      .run(id, userId, expiresAt);
    return this.findById(id);
  }

  findById(id) {
    return this.db.prepare('SELECT id, userId, createdAt, expiresAt FROM Session WHERE id = ?').get(id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM Session WHERE id = ?').run(id);
  }

  deleteExpired() {
    return this.db.prepare('DELETE FROM Session WHERE expiresAt <= ?').run(new Date().toISOString());
  }
}
