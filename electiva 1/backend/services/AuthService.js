import { UnauthorizedError, ValidationError } from '../errors/AppError.js';
import { verifyPassword } from '../db.js';

export default class AuthService {
  constructor(userRepository) {
    this.users = userRepository;
  }

  login(data = {}) {
    const username = String(data.username || '').trim();
    const password = String(data.password || '');
    if (!username || !password) {
      throw new ValidationError('Usuario y contrasena son obligatorios');
    }

    const user = this.users.findAuthByUsername(username);
    if (!user || !Number(user.active) || !verifyPassword(password, user.password)) {
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const { password: _password, ...safeUser } = user;
    return { user: safeUser };
  }
}
