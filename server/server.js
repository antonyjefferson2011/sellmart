require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const express = require('express');
const app = express();
const root = path.join(__dirname, '..');

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  const o = process.env.ALLOWED_ORIGIN;
  if (o && req.headers.origin === o) {
    res.set({ 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '3mb' }));

// Rate limit simples em memoria (por IP) para rotas de IA/upload
const hits = new Map();
function limit(max, windowMs) {
  return (req, res, next) => {
    const k = req.ip + req.path, now = Date.now();
    const arr = (hits.get(k) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: 'Muitas requisicoes. Aguarde um instante.' });
    arr.push(now); hits.set(k, arr); next();
  };
}
app.use('/api/generate', limit(8, 60000));
app.use('/api/upload', limit(20, 60000));

// Somente os 3 arquivos publicos sao servidos (nunca .env ou server/)
['index.html', 'style.css', 'script.js'].forEach(f =>
  app.get(f === 'index.html' ? ['/', '/index.html'] : '/' + f, (q, r) => r.sendFile(path.join(root, f))));

app.get('/api/config', (req, res) => res.json({
  groq: !!process.env.GROQ_API_KEY && !!process.env.GROQ_MODEL,
  imgbb: !!process.env.IMGBB_API_KEY,
  supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '' // chave publica (anon) apenas
}));
app.get('/api/health', (q, r) => r.json({ ok: true }));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api', (q, r) => r.status(404).json({ error: 'Rota nao encontrada.' }));
app.use((err, q, r, n) => r.status(err.status === 413 ? 413 : 400).json({ error: err.status === 413 ? 'Corpo grande demais.' : 'Requisicao invalida.' }));

module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Sellmart em http://localhost:' + port));
}
