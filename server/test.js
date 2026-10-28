// Testes basicos do backend (sem chaves reais: valida os caminhos de erro)
const assert = require('assert');
delete process.env.GROQ_API_KEY; delete process.env.IMGBB_API_KEY;
const app = require('./server');
const srv = app.listen(0, async () => {
  const b = 'http://localhost:' + srv.address().port;
  const post = (u, body) => fetch(b + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.strictEqual((await fetch(b + '/api/health')).status, 200);
    const cfg = await (await fetch(b + '/api/config')).json();
    assert.strictEqual(cfg.groq, false); assert.strictEqual(cfg.imgbb, false);
    assert.strictEqual((await fetch(b + '/.env')).status, 404);
    assert.strictEqual((await post('/api/generate', { project: { name: 'x', type: 'saas' } })).status, 503);
    assert.strictEqual((await post('/api/upload', { data: 'AAAA', mime: 'image/png' })).status, 503);
    process.env.IMGBB_API_KEY = 'x';
    assert.strictEqual((await post('/api/upload', { data: '<script>', mime: 'image/png' })).status, 400);
    assert.strictEqual((await post('/api/upload', { data: 'AAAA', mime: 'text/html' })).status, 400);
    let last; for (let i = 0; i < 10; i++) last = await post('/api/generate', {});
    assert.strictEqual(last.status, 429);
    console.log('TODOS OS TESTES PASSARAM');
  } catch (e) { console.error('FALHOU:', e.message); process.exitCode = 1; }
  srv.close();
});
