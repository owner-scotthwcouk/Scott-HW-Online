import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { neonConfig } from '@neondatabase/serverless';
import dataHandler, { portfolioSchema } from '../api/data.js';
import loginHandler from '../api/login.js';
import { normalizePortfolio, saveProject, saveMissionUpdate } from '../src/portfolioData.js';
import { sign, verify, scope } from '../session.js';
import { initializeDatabase } from '../database.js';
import { writePortfolio, readPortfolio, deletePortfolio } from '../autonoma-store.js';

// Exercise real handlers and parameterized driver queries against a controlled
// Neon HTTP response fixture. This does not verify a hosted Postgres service.
process.env.DATABASE_URL = 'postgresql://test:test@fixture.neon.tech/test';
process.env.ADMIN_UN = 'test-admin';
process.env.ADMIN_PW = 'test-password';
process.env.ADMIN_SESSION_SECRET = 'test-only-session-secret-at-least-32-characters';
const records = new Map();
neonConfig.fetchFunction = async (_url, options) => {
  const { query, params } = JSON.parse(options.body);
  let rows = [];
  if (query.startsWith('INSERT')) {
    const production = query.includes("'production'");
    const id = production ? 'production' : params[0];
    const data = JSON.parse(params[production ? 0 : 1]);
    if (!records.has(id) || !production) records.set(id, { data, version: (records.get(id)?.version || 0) + 1 });
  } else if (query.startsWith('SELECT')) {
    const row = records.get(params[0]); if (row) rows = [row];
  } else if (query.startsWith('UPDATE')) {
    const row = records.get(params[1]);
    if (row && row.version === Number(params[2])) {
      const next = { data: JSON.parse(params[0]), version: row.version + 1 };
      records.set(params[1], next); rows = [next];
    }
  } else if (query.startsWith('DELETE')) records.delete(params[0]);
  else assert.match(query, /^CREATE TABLE/);
  return { ok: true, json: async () => ({ fields: [{ name: 'data', dataTypeID: 3802 }, { name: 'version', dataTypeID: 23 }], rows: rows.map(row => [JSON.stringify(row.data), String(row.version)]) }) };
};
async function call(handler, method, body, cookie = '', origin = 'http://localhost:10000') {
  const res = { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.statusCode=n; return this; }, json(value) { this.body=value; return this; } };
  await handler({ method, body, headers: { host: 'localhost:10000', origin, cookie } }, res);
  return res;
}
test('CRUD persists, preserves other sections, rejects stale and unauthorized writes', async () => {
  await initializeDatabase();
  const initial = (await call(dataHandler, 'GET')).body;
  assert.equal(portfolioSchema.safeParse(initial).success, true);
  assert.equal((await call(dataHandler, 'PUT', initial)).statusCode, 401);
  assert.equal((await call(loginHandler, 'POST', { username: 'test-admin', password: 'wrong' })).statusCode, 401);
  const login = await call(loginHandler, 'POST', { username: 'test-admin', password: 'test-password' });
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  assert.match(login.headers['Set-Cookie'], /HttpOnly/);
  let next = saveProject(initial, { title: 'New', stardate: '2026', desc: 'Test', url: 'https://example.com' });
  next = saveMissionUpdate(next, { update_title: 'Mission', stardate: '2026', update_desc: 'Test' });
  let saved = await call(dataHandler, 'PUT', next, cookie);
  assert.equal(saved.statusCode, 200);
  const project = saved.body.projects.at(-1);
  next = saveProject(saved.body, { ...project, title: 'Renamed', stardate: '2027' });
  next.contact.email = 'updated@example.com';
  saved = await call(dataHandler, 'PUT', next, cookie);
  assert.equal(saved.body.projects.length, initial.projects.length + 1);
  assert.equal(saved.body.projects.at(-1).id, project.id);
  assert.deepEqual(saved.body.edumaxim, initial.edumaxim);
  assert.equal((await call(dataHandler, 'PUT', initial, cookie)).statusCode, 409);
  assert.equal((await call(dataHandler, 'PUT', saved.body, cookie, 'https://attacker.test')).statusCode, 401);
  const malicious = structuredClone(saved.body); malicious.projects[0].url = 'javascript:alert(1)';
  assert.equal((await call(dataHandler, 'PUT', malicious, cookie)).statusCode, 400);
  next = { ...saved.body, projects: saved.body.projects.filter(p => p.id !== project.id), mission_update: saved.body.mission_update.slice(0,-1) };
  assert.equal((await call(dataHandler, 'PUT', next, cookie)).statusCode, 200);
  await initializeDatabase();
  const reloaded = (await call(dataHandler, 'GET')).body;
  assert.equal(reloaded.projects.length, initial.projects.length);
  assert.equal(reloaded.contact.email, 'updated@example.com');
  assert.match((await call(loginHandler, 'DELETE', null, cookie)).headers['Set-Cookie'], /Max-Age=0/);
});
test('signed test scopes isolate persistence and teardown from production', async () => {
  const data = normalizePortfolio(JSON.parse(await readFile(new URL('../public/data.json', import.meta.url))));
  await writePortfolio('portfolio-test', data);
  const signed = sign({ scope: 'portfolio-test', exp: Date.now()+10000 });
  assert.equal(scope({ headers: { cookie: 'autonoma-portfolio=portfolio-test' } }), 'production');
  assert.equal(scope({ headers: { cookie: `autonoma-portfolio=${signed}` } }), 'portfolio-test');
  assert.equal(verify(sign({ exp: Date.now()-1 })), null);
  assert.equal(verify(signed+'x'), null);
  assert.ok((await readPortfolio('portfolio-test')).projects.length);
  await deletePortfolio('portfolio-test');
  assert.ok(records.has('production'));
  await assert.rejects(readPortfolio('portfolio-test'), { status: 404 });
  await assert.rejects(deletePortfolio('production'));
});

test('signed Autonoma standard recipe seeds valid CRUD content and tears down', async () => {
  process.env.AUTONOMA_SHARED_SECRET = 'test-shared-secret';
  process.env.AUTONOMA_SIGNING_SECRET = 'test-private-signing-secret';
  const { autonomaHandler } = await import('../autonoma.js');
  const { signBody } = await import('@autonoma-ai/sdk');
  const recipe = JSON.parse((await readFile(new URL('../docs/autonoma-recipe.json', import.meta.url), 'utf8')).replaceAll('{{testRunShortId}}', 'test123'));
  async function sdk(body, signed = true) {
    const raw = JSON.stringify(body);
    const res = { statusCode: 200, status(n) { this.statusCode=n; return this; }, json(data) { this.body=data; return this; } };
    await autonomaHandler({ body: raw, headers: { 'x-signature': signed ? signBody(raw, process.env.AUTONOMA_SHARED_SECRET) : '' } }, res);
    return res;
  }
  assert.notEqual((await sdk({ action: 'discover' }, false)).statusCode, 200);
  const up = await sdk({ action: 'up', testRunId: 'recipe-test', create: recipe.create });
  assert.equal(up.statusCode, 200, JSON.stringify(up.body));
  const seeded = await readPortfolio('portfolio-recipe-test');
  assert.equal(portfolioSchema.safeParse(seeded).success, true);
  assert.equal(seeded.projects.length, 3);
  assert.equal(seeded.mission_update.length, 3);
  assert.equal(up.body.refs.Project[0].id, seeded.projects[0].id);
  const cookie = up.body.auth.cookies[0];
  assert.equal(scope({ headers: { cookie: `${cookie.name}=${cookie.value}` } }), 'portfolio-recipe-test');
  const down = await sdk({ action: 'down', refsToken: up.body.refsToken });
  assert.equal(down.statusCode, 200);
  assert.equal(records.has('portfolio-recipe-test'), false);
  assert.equal(records.has('production'), true);
});
