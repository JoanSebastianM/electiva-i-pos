import { ForbiddenError } from '../errors/ForbiddenError.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { sessionService } from '../container.js';
import { parseCookies, SESSION_COOKIE_NAME, POS_CLIENT_HEADER, POS_CLIENT_VALUE } from '../utils/http.js';

export function requirePosClient(req, _res, next) {
  const method = String(req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next();
  if (req.get(POS_CLIENT_HEADER) !== POS_CLIENT_VALUE) {
    return next(new ForbiddenError('Cliente no autorizado'));
  }
  return next();
}

export function authenticate(req, _res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME];
    const valid = sessionService.getValid(sessionId);
    if (!valid) throw new UnauthorizedError('Sesion invalida o expirada');

    req.user = valid.user;
    req.sessionId = valid.session.id;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError('No tienes permisos para esta operacion'));
    return next();
  };
}

export function adminExceptRead(req, _res, next) {
  if (String(req.method || '').toUpperCase() === 'GET') return next();
  return authorize('admin')(req, _res, next);
}

export function salesPolicy(req, _res, next) {
  const method = String(req.method || '').toUpperCase();
  if (method === 'GET' || method === 'POST') return next();
  return authorize('admin')(req, _res, next);
}
