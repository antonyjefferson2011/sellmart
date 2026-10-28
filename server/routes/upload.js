const router = require('express').Router();
const OK = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

router.post('/', async (req, res) => {
  const key = process.env.IMGBB_API_KEY;
  if (!key) return res.status(503).json({ error: 'Upload indisponivel: configure IMGBB_API_KEY no servidor.' });
  const { data, mime } = req.body || {};
  if (typeof data !== 'string' || !OK.includes(mime) || !/^[A-Za-z0-9+/=]+$/.test(data) || data.length > 2.6e6)
    return res.status(400).json({ error: 'Imagem invalida (PNG, JPG, WEBP ou GIF de ate ~1,8 MB).' });
  try {
    const r = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST', signal: AbortSignal.timeout(30000),
      body: new URLSearchParams({ key, image: data })
    });
    const j = await r.json().catch(() => null);
    const url = j && j.success && j.data && j.data.url;
    if (!r.ok || typeof url !== 'string' || !url.startsWith('https://')) return res.status(502).json({ error: 'O ImgBB nao confirmou o upload.' });
    res.json({ url });
  } catch (e) { res.status(504).json({ error: 'ImgBB indisponivel.' }); }
});
module.exports = router;
