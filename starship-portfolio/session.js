import { createHmac, timingSafeEqual } from 'node:crypto';
function secret() {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key || key.length < 32) throw new Error('Configure ADMIN_SESSION_SECRET (at least 32 characters)');
  return key;
}
export function sign(value) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}
export function verify(token) {
  try {
    const [payload, signature] = token.split('.');
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return value.exp > Date.now() ? value : null;
  } catch { return null; }
}
export function cookie(req, name) {
  return req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}
export function scope(req) { return verify(cookie(req, 'autonoma-portfolio'))?.scope || 'production'; }
export function authorized(req) {
  const session = verify(cookie(req, 'portfolio-session'));
  return session?.admin === true && session.scope === scope(req);
}
export function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
export function sessionCookie(value, clear = false) {
  return `portfolio-session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : 28800}${process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : ''}`;
}
