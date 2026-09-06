import { timingSafeEqual, createHash } from 'node:crypto';
import { getAdminCredentials } from '../adminCredentials.js';
import { sameOrigin, scope, sessionCookie, sign } from '../session.js';
const equal = (a, b) => timingSafeEqual(createHash('sha256').update(String(a || '')).digest(), createHash('sha256').update(String(b || '')).digest());
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Invalid origin' });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', true));
    return res.json({ success: true });
  }
  const credentials = getAdminCredentials();
  if (!credentials || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) return res.status(503).json({ error: 'Admin authentication is not configured' });
  if (!equal(req.body?.username, credentials.username) || !equal(req.body?.password, credentials.password)) return res.status(401).json({ error: 'Invalid credentials' });
  res.setHeader('Set-Cookie', sessionCookie(sign({ admin: true, scope: scope(req), exp: Date.now() + 28800000 })));
  return res.json({ success: true });
}
