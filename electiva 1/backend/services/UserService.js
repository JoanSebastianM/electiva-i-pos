import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';
import { createPasswordHash } from '../db.js';

const ALLOWED_ROLES = ['admin', 'cajero'];

function normalizeRole(value, fallback = 'cajero') {
  const role = String(value || '').trim() || fallback;
  if (!ALLOWED_ROLES.includes(role)) throw new ValidationError('El rol debe ser admin o cajero');
  return role;
}

export default class UserService extends CrudService {
  constructor(userRepository) {
    super(userRepository, { notFoundMessage: 'Usuario no encontrado' });
  }

  validateCreate(data) {
    const username = String(data.username || '').trim();
    const name = String(data.name || '').trim();
    const password = String(data.password || '');
    const role = normalizeRole(data.role);

    if (!username) throw new ValidationError('El usuario es obligatorio');
    if (!name) throw new ValidationError('El nombre es obligatorio');
    if (password.length < 4) throw new ValidationError('La contrasena debe tener al menos 4 caracteres');

    const existing = this.repository.findAuthByUsername(username);
    if (existing) throw new ValidationError('El nombre de usuario ya existe');

    return { username, name, role, active: data.active === 0 ? 0 : 1, password: createPasswordHash(password) };
  }

  validateUpdate(data) {
    const existing = this.repository.findWithPasswordById ? this.repository.findWithPasswordById(data.id) : null;
    const username = String(data.username || existing?.username || '').trim();
    const name = String(data.name || existing?.name || '').trim();
    const role = normalizeRole(data.role ?? existing?.role, 'cajero');
    const active = data.active === 0 ? 0 : 1;

    if (!username) throw new ValidationError('El usuario es obligatorio');
    if (!name) throw new ValidationError('El nombre es obligatorio');

    const other = this.repository.findAuthByUsername(username);
    if (other && Number(other.id) !== Number(data.id)) throw new ValidationError('El nombre de usuario ya existe');

    const payload = { username, name, role, active };
    if (data.password) {
      const password = String(data.password);
      if (password.length < 4) throw new ValidationError('La contrasena debe tener al menos 4 caracteres');
      payload.password = createPasswordHash(password);
    }
    return payload;
  }

  update(id, data) {
    return super.update(id, { ...data, id: Number(id) });
  }
}
