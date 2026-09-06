import { z } from 'zod';
import { readRecord, saveRecord } from '../database.js';
import { authorized, sameOrigin, scope } from '../session.js';
const text = z.string().max(20000);
const url = z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//i.test(v))]);
const id = z.string().min(1).max(100);
export const portfolioSchema = z.object({
  _version: z.number().int().positive(),
  projects: z.array(z.object({ id, stardate: text, title: text.min(1), desc: text, url })).max(1000),
  mission_update: z.array(z.object({ id, stardate: text, update_title: text.min(1), update_desc: text })).max(1000),
  contact: z.object({ email: z.union([z.literal(''), z.string().email()]), github: url, linkedin: url }),
  about: z.object({ title: text, image: text.refine(v => !/^[a-z]+:/i.test(v) || /^https?:\/\//i.test(v)), bio: text, inspiration: text, closing: text }),
}).refine(data => [data.projects, data.mission_update].every(items => new Set(items.map(item => item.id)).size === items.length), 'Duplicate record IDs');
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'PUT' && (!sameOrigin(req) || !authorized(req))) return res.status(401).json({ error: 'Please sign in again before saving.' });
  try {
    const current = await readRecord(scope(req));
    if (req.method === 'GET') return res.json(current);
    const parsed = portfolioSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Check required fields, email, and http/https links.' });
    return res.json(await saveRecord(scope(req), { ...current, ...parsed.data }, parsed.data._version));
  } catch (error) {
    return res.status(error.status || 503).json({ error: error.status ? error.message : 'Database unavailable. Check database configuration and initialization.' });
  }
}
