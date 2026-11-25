export const SESSION_COOKIE_NAME = 'pg_session';
export const POS_CLIENT_HEADER = 'x-pos-client';
export const POS_CLIENT_VALUE = 'pos-granizados';

export function parseCookies(header = '') {
  const result = {};
  for (const part of String(header).split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }
  return result;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: Number(process.env.SESSION_TTL_HOURS || 8) * 60 * 60 * 1000
  };
}
