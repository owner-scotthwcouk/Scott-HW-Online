import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { normalizePortfolio } from './src/portfolioData.js';
export function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}
export async function readRecord(id) {
  const sql = database();
  const rows = await sql`SELECT data, version FROM portfolio_documents WHERE id = ${id}`;
  if (!rows.length) throw Object.assign(new Error('Portfolio not found'), { status: 404 });
  return { ...rows[0].data, _version: rows[0].version };
}
export async function saveRecord(id, data, version) {
  const sql = database();
  const { _version, ...content } = normalizePortfolio(data);
  const rows = await sql`UPDATE portfolio_documents SET data = ${JSON.stringify(content)}::jsonb, version = version + 1 WHERE id = ${id} AND version = ${version} RETURNING data, version`;
  if (!rows.length) throw Object.assign(new Error('Content changed in another session. Reload before editing again.'), { status: 409 });
  return { ...rows[0].data, _version: rows[0].version };
}
export async function initializeDatabase() {
  const sql = database();
  await sql`CREATE TABLE IF NOT EXISTS portfolio_documents (id text PRIMARY KEY, data jsonb NOT NULL, version integer NOT NULL DEFAULT 1)`;
  const data = normalizePortfolio(JSON.parse(await readFile(new URL('./public/data.json', import.meta.url), 'utf8')));
  await sql`INSERT INTO portfolio_documents (id, data) VALUES ('production', ${JSON.stringify(data)}::jsonb) ON CONFLICT (id) DO NOTHING`;
}
