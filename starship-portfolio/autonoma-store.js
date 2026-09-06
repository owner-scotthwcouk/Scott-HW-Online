import { database, readRecord, saveRecord } from './database.js';
import { normalizePortfolio } from './src/portfolioData.js';
function testId(id) {
  if (!/^portfolio-[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid test portfolio id');
  return id;
}
export async function readPortfolio(id) { return readRecord(testId(id)); }
export async function writePortfolio(id, data) {
  const sql = database();
  const content = normalizePortfolio(data);
  await sql`INSERT INTO portfolio_documents (id, data) VALUES (${testId(id)}, ${JSON.stringify(content)}::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, version = portfolio_documents.version + 1`;
  return content;
}
export async function updatePortfolio(id, update) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readPortfolio(id);
    try { return await saveRecord(testId(id), update(current), current._version); }
    catch (error) { if (error.status !== 409 || attempt === 4) throw error; }
  }
}
export async function deletePortfolio(id) {
  const sql = database();
  await sql`DELETE FROM portfolio_documents WHERE id = ${testId(id)}`;
}
