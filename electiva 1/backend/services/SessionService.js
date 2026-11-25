import crypto from 'node:crypto';

export default class SessionService {
  constructor({ sessions, users } = {}) {
    if (!sessions) throw new Error('SessionService requiere sessions');
    if (!users) throw new Error('SessionService requiere users');
    this.sessions = sessions;
    this.users = users;
    this.ttlHours = Number(process.env.SESSION_TTL_HOURS || 8);
  }

  create(userId) {
    this.sessions.deleteExpired();
    const session = this.sessions.create({
      id: crypto.randomBytes(32).toString('hex'),
      userId: Number(userId),
      expiresAt: new Date(Date.now() + this.ttlHours * 60 * 60 * 1000).toISOString()
    });
    return session;
  }

  getValid(id) {
    if (!id) return null;
    const session = this.sessions.findById(id);
    if (!session) return null;
    if (Date.parse(session.expiresAt) <= Date.now()) {
      this.sessions.delete(id);
      return null;
    }

    const user = this.users.findById(session.userId);
    if (!user || !Number(user.active)) {
      this.sessions.delete(id);
      return null;
    }

    return { session, user };
  }

  remove(id) {
    if (!id) return;
    this.sessions.delete(id);
  }
}
