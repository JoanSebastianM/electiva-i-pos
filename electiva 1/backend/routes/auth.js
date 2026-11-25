import { Router } from 'express';
import { authService, sessionService } from '../container.js';
import { authenticate } from '../middleware/auth.js';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../utils/http.js';

const router = Router();

router.post('/login', (req, res, next) => {
  try {
    const { user } = authService.login(req.body ?? {});
    const session = sessionService.create(user.id);
    res.cookie(SESSION_COOKIE_NAME, session.id, sessionCookieOptions());
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authenticate, (req, res) => {
  sessionService.remove(req.sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

export default router;
