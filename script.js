'use strict';
/* Sellmart Factory v0.1 — todo conteudo de usuario entra no DOM via textContent (sem innerHTML). */
const KEY = 'sellmart.projects.v1';
const TYPES = [['saas','SaaS','Aplicacao web com contas e recursos recorrentes.'],['landing','Landing page','Pagina unica focada em conversao.'],['site','Site institucional','Apresenta empresa, servicos e contato.'],['catalogo','Catalogo','Lista de produtos sem checkout.'],['loja','Loja virtual demonstrativa','Vitrine com precos informativos.'],['dashboard','Dashboard','Paineis e indicadores.'],['ferramenta','Ferramenta online','Utilitario ou gerador.'],['agenda','Sistema de agendamento','Reservas e horarios.'],['outro','Outro','Descreva com suas palavras.']];
const FEATS = [['auth','Cadastro e login','b'],['userdash','Dashboard do usuario','b'],['profile','Perfil','b'],['history','Historico','b'],['fav','Favoritos','l'],['search','Pesquisa','l'],['filters','Filtros','l'],['prodmgmt','Gestao de produtos','b'],['forms','Formularios','l'],['reports','Relatorios','b'],['admin','Area administrativa','b'],['db','Banco de dados','b'],['upload','Upload de imagens','b']];
const FONTS = {Sistema:'system-ui,sans-serif',Serifada:'Georgia,serif',Monoespacada:'ui-monospace,Consolas,monospace'};
const TEMPLATES = [['saas','Painel SaaS','Gestao com recursos de conta.'],['landing','Landing de produto','Hero, beneficios e FAQ.'],['loja','Vitrine demonstrativa','Catalogo com precos informativos.'],['agenda','Agendamento','Servicos e horarios.']];

const $ = s => document.querySelector(s);
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex = c => /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#000000';
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
function toast(msg, bad) { const d = h('div', { class: bad ? 'err' : 'okc' }, msg); $('#toast').append(d); setTimeout(() => d.remove(), 4500); }

/* ---------- Armazenamento local ---------- */
let projects = [];
try { const r = JSON.parse(localStorage.getItem(KEY) || '[]'); projects = Array.isArray(r) ? r : []; } catch (e) { projects = []; }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(projects)); return true; } catch (e) { toast('Nao foi possivel salvar localmente (armazenamento cheio/bloqueado).', true); return false; } }
function blank(type) {
  const now = new Date().toISOString();
  return { id: uid(), name: '', type: type || 'saas', status: 'rascunho', created: now, updated: now,
    info: { brand: '', description: '', problem: '', audience: '', goal: '', lang: 'pt-BR', slogan: '', differentials: '', wishes: '', currency: 'BRL' },
    theme: { primary: '#22d3ee', secondary: '#6366f1', accent: '#f59e0b', bg: '#070b12', text: '#e6edf5', mode: 'dark', style: 'moderno', radius: 12, font: 'Sistema', btn: 'solido' },
    content: { title: '', subtitle: '', intro: '', cta: 'Comece agora', benefits: '', featuresText: '', faq: '', footer: '', legal: 'Este site e um prototipo. Precos meramente informativos.' },
    products: [], features: [] };
}

/* ---------- Estado e integracoes ---------- */
let view = 'home', step = 0, draft = null, plan = '', cfg = { groq: false, imgbb: false, supabase: false, loaded: false };
fetch('/api/config').then(r => r.json()).then(c => { cfg = { ...c, loaded: true }; render(); }).catch(() => { cfg.loaded = true; render(); });
const get = (o, p) => p.split('.').reduce((a, k) => a && a[k], o);
function set(o, p, v) { const ks = p.split('.'); const l = ks.pop(); ks.reduce((a, k) => a[k], o)[l] = v; }

/* ---------- Previa ---------- */
function previewDoc(p) {
  const t = p.theme, c = p.content, lines = s => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const money = n => { try { return new Intl.NumberFormat(p.info.lang || 'pt-BR', { style: 'currency', currency: p.info.currency || 'BRL' }).format(n); } catch (e) { return String(n); } };
  const bg = t.mode === 'light' ? '#ffffff' : hex(t.bg), tx = t.mode === 'light' ? '#111827' : hex(t.text);
  const btn = t.btn === 'contorno' ? `background:none;border:2px solid ${hex(t.primary)};color:${hex(t.primary)}` : `background:${hex(t.primary)};color:#fff;border:2px solid ${hex(t.primary)}`;
  const faq = lines(c.faq).map(l => { const [q, ...a] = l.split('|'); return `<details><summary>${esc(q)}</summary><p>${esc(a.join('|'))}</p></details>`; }).join('');
  const prods = p.products.map(x => `<div class="c">${/^https:\/\//.test(x.image || '') ? `<img src="${esc(x.image)}" alt="">` : ''}<h3>${esc(x.name)}${x.featured ? ' *' : ''}</h3><p>${esc(x.description)}</p><b>${money(Number(x.price) || 0)}</b><small>${esc(x.category)}${x.available ? '' : ' — indisponivel'}</small></div>`).join('');
  const feats = p.features.map(id => (FEATS.find(f => f[0] === id) || [])[1]).filter(Boolean);
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--p:${hex(t.primary)};--s:${hex(t.secondary)};--a:${hex(t.accent)};--r:${Number(t.radius) || 0}px}
body{margin:0;background:${bg};color:${tx};font-family:${FONTS[t.font] || FONTS.Sistema};line-height:1.5}
section{padding:36px 8%}.hero{background:linear-gradient(135deg,var(--p),var(--s));color:#fff}.hero h1{margin:0 0 8px;font-size:2rem}
.b{display:inline-block;padding:10px 20px;border-radius:var(--r);${btn};font:inherit;margin-top:10px}
.g{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.c{border:1px solid #8884;border-radius:var(--r);padding:14px}.c img{max-width:100%;border-radius:var(--r)}
b{color:var(--a)}small{display:block;opacity:.7}footer{padding:20px 8%;opacity:.75;font-size:.85rem}</style>
<section class="hero"><h1>${esc(c.title || p.name || 'Titulo do produto')}</h1><p>${esc(c.subtitle || p.info.slogan)}</p><span class="b">${esc(c.cta)}</span></section>
${c.intro ? `<section><p>${esc(c.intro)}</p></section>` : ''}
${c.benefits ? `<section><h2>Beneficios</h2><div class="g">${lines(c.benefits).map(l => `<div class="c">${esc(l)}</div>`).join('')}</div></section>` : ''}
${feats.length || c.featuresText ? `<section><h2>Funcionalidades</h2><div class="g">${lines(c.featuresText).concat(feats).map(l => `<div class="c">${esc(l)}</div>`).join('')}</div></section>` : ''}
${prods ? `<section><h2>Produtos e servicos</h2><div class="g">${prods}</div></section>` : ''}
${faq ? `<section><h2>Perguntas frequentes</h2>${faq}</section>` : ''}
<footer>${esc(c.footer || p.info.brand)}<br>${esc(c.legal)}</footer>`;
}
function previewFrame() { const f = h('iframe', { sandbox: '', title: 'Previa' }); f.srcdoc = previewDoc(draft); return f; }
function refreshPreview() { const f = $('iframe'); if (f) f.srcdoc = previewDoc(draft); }

/* ---------- Campos ---------- */
function field(label, path, kind, opts) {
  let el;
  const v = get(draft, path);
  if (kind === 'area') el = h('textarea', { rows: 3 });
  else if (kind === 'select') el = h('select', {}, opts.map(o => h('option', { value: Array.isArray(o) ? o[0] : o }, Array.isArray(o) ? o[1] : o)));
  else el = h('input', { type: kind || 'text' });
  el.value = v ?? '';
  el.addEventListener('input', () => { set(draft, path, kind === 'range' || kind === 'number' ? Number(el.value) : el.value); refreshPreview(); });
  return h('div', {}, h('label', {}, label), el);
}

/* ---------- Assistente ---------- */
const STEPS = ['Tipo', 'Informacoes', 'Visual', 'Textos', 'Produtos', 'Recursos', 'Revisao'];
function stepBody() {
  const d = draft;
  switch (step) {
    case 0: return h('div', { class: 'grid' }, TYPES.map(([id, n, desc]) => h('div', { class: 'card opt' + (d.type === id ? ' sel' : ''), onclick: () => { d.type = id; render(); } }, h('b', {}, n), h('div', { class: 'mut' }, desc))));
    case 1: return h('div', {}, field('Nome do produto *', 'name'), field('Marca/empresa *', 'info.brand'), field('Descricao *', 'info.description', 'area'), field('Problema que resolve', 'info.problem', 'area'), field('Publico-alvo', 'info.audience'), field('Objetivo principal', 'info.goal'), field('Idioma', 'info.lang', 'select', [['pt-BR', 'Portugues (BR)'], ['en-US', 'English'], ['es-ES', 'Espanol']]), field('Moeda', 'info.currency', 'select', ['BRL', 'USD', 'EUR']), field('Slogan', 'info.slogan'), field('Diferenciais', 'info.differentials', 'area'), field('Funcionalidades desejadas (com suas palavras)', 'info.wishes', 'area'));
    case 2: return h('div', {}, field('Cor primaria', 'theme.primary', 'color'), field('Cor secundaria', 'theme.secondary', 'color'), field('Cor de destaque', 'theme.accent', 'color'), field('Cor do fundo', 'theme.bg', 'color'), field('Cor dos textos', 'theme.text', 'color'), field('Tema', 'theme.mode', 'select', [['dark', 'Escuro'], ['light', 'Claro']]), field('Estilo visual', 'theme.style', 'select', ['moderno', 'minimalista', 'corporativo']), field('Arredondamento (px)', 'theme.radius', 'range'), field('Tipografia', 'theme.font', 'select', Object.keys(FONTS)), field('Botoes', 'theme.btn', 'select', [['solido', 'Solido'], ['contorno', 'Contorno']]));
    case 3: return h('div', {}, field('Titulo principal', 'content.title'), field('Subtitulo', 'content.subtitle'), field('Texto de apresentacao', 'content.intro', 'area'), field('Texto do botao', 'content.cta'), field('Beneficios (um por linha)', 'content.benefits', 'area'), field('Funcionalidades (uma por linha)', 'content.featuresText', 'area'), field('FAQ (uma por linha: pergunta|resposta)', 'content.faq', 'area'), field('Rodape', 'content.footer'), field('Texto legal', 'content.legal', 'area'),
      h('p', { class: 'mut' }, cfg.groq ? '' : 'Sugestoes por IA indisponiveis: configure GROQ_API_KEY e GROQ_MODEL no servidor. Edicao manual funciona normalmente.'));
    case 4: return productsStep();
    case 5: return h('div', {}, h('p', { class: 'warn card' }, 'Nesta versao, os recursos abaixo sao apenas DECLARADOS na configuracao/plano e aparecem na previa como lista. Nenhum deles e implementado no produto gerado. "Exige backend" = precisaria de servidor/banco; "Possivel no frontend" = poderia rodar no navegador numa versao futura.'),
      FEATS.map(([id, n, lv]) => h('label', {}, h('input', { type: 'checkbox', checked: d.features.includes(id) ? '' : false, onchange: e => { d.features = e.target.checked ? [...d.features, id] : d.features.filter(x => x !== id); refreshPreview(); } }), ' ' + n + ' — ', h('span', { class: 'mut' }, lv === 'b' ? 'exige backend' : 'possivel no frontend'))));
    default: return reviewStep();
  }
}
function productsStep() {
  const d = draft;
  const wrap = h('div', {}, h('button', { class: 'pri', onclick: () => { d.products.push({ id: uid(), name: '', description: '', price: 0, category: '', image: '', available: true, featured: false }); render(); } }, 'Adicionar produto'),
    h('p', { class: 'mut' }, 'Precos sao informativos: nao ha pagamento nesta versao.'));
  d.products.forEach((p, i) => {
    const st = h('small', { class: 'mut' }, p.image ? 'Imagem enviada (URL salva).' : '');
    const prev = h('img', { alt: '', style: 'max-width:120px;display:none;border-radius:8px' });
    const file = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif' });
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(f.type) || f.size > 1.8e6) { st.textContent = 'Arquivo invalido: use PNG/JPG/WEBP/GIF ate 1,8 MB.'; st.className = 'err'; file.value = ''; return; }
      prev.src = URL.createObjectURL(f); prev.style.display = 'block';
      if (!cfg.imgbb) { st.textContent = 'Previa local apenas. ImgBB nao configurado: a imagem NAO foi enviada nem sera salva.'; return; }
      st.textContent = 'Enviando...';
      try {
        const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(f); });
        const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, mime: f.type }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Falha no upload.');
        p.image = j.url; st.textContent = 'Enviada com sucesso.'; st.className = 'okc'; refreshPreview();
      } catch (e) { st.textContent = 'Falha: ' + e.message; st.className = 'err'; }
    });
    const bind = (label, key, kind) => { const el = h(kind === 'area' ? 'textarea' : 'input', { type: kind === 'area' ? null : (kind || 'text'), step: kind === 'number' ? '0.01' : null, min: kind === 'number' ? '0' : null }); el.value = p[key]; el.addEventListener('input', () => { p[key] = kind === 'number' ? Math.max(0, Number(el.value) || 0) : el.value; refreshPreview(); }); return h('div', {}, h('label', {}, label), el); };
    wrap.append(h('div', { class: 'card', style: 'margin-top:12px' }, bind('Nome', 'name'), bind('Descricao', 'description', 'area'), bind('Preco', 'price', 'number'), bind('Categoria', 'category'), h('label', {}, 'Imagem'), file, prev, st,
      h('label', {}, h('input', { type: 'checkbox', checked: p.available ? '' : false, onchange: e => { p.available = e.target.checked; refreshPreview(); } }), ' Disponivel'),
      h('label', {}, h('input', { type: 'checkbox', checked: p.featured ? '' : false, onchange: e => { p.featured = e.target.checked; refreshPreview(); } }), ' Destaque'),
      h('button', { class: 'danger', onclick: () => { if (confirm('Remover este produto?')) { d.products.splice(i, 1); render(); } } }, 'Remover')));
  });
  return wrap;
}
function validate(p) {
  const e = [];
  if (!p.name.trim()) e.push('Informe o nome do produto (etapa 2).');
  if (!p.info.brand.trim()) e.push('Informe a marca/empresa (etapa 2).');
  if (p.info.description.trim().length < 10) e.push('Descreva o projeto com ao menos 10 caracteres (etapa 2).');
  p.products.forEach((x, i) => { if (!x.name.trim()) e.push(`Produto ${i + 1} sem nome (etapa 5).`); });
  return e;
}
function reviewStep() {
  const d = draft, errs = validate(d), out = h('div', { class: 'pre' }, plan || 'O plano de implementacao aparecera aqui.');
  const gen = h('button', { class: 'pri', onclick: async () => {
    const e = validate(d); if (e.length) { toast(e[0], true); return; }
    if (!cfg.groq) { toast('Geracao por IA indisponivel: configure GROQ_API_KEY e GROQ_MODEL no servidor. Voce ainda pode salvar e exportar JSON.', true); return; }
    gen.disabled = true; gen.textContent = 'Gerando...';
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: d }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Falha na geracao.');
      plan = j.plan; out.textContent = plan; toast('Plano gerado (nao e um app pronto).');
    } catch (x) { toast(x.message, true); }
    gen.disabled = false; gen.textContent = 'Gerar projeto';
  } }, 'Gerar projeto');
  return h('div', {}, errs.length ? h('div', { class: 'card warn' }, errs.map(x => h('div', {}, x))) : h('div', { class: 'card okc' }, 'Dados validos.'),
    h('div', { class: 'card', style: 'margin-top:10px' }, [['Tipo', (TYPES.find(t => t[0] === d.type) || [])[1]], ['Nome', d.name], ['Marca', d.info.brand], ['Produtos', d.products.length], ['Recursos', d.features.length]].map(([k, v]) => h('div', {}, h('b', {}, k + ': '), String(v ?? '')))),
    h('div', { class: 'row' }, gen, h('button', { onclick: () => exportJson(d) }, 'Exportar JSON')),
    h('p', { class: 'mut' }, 'A geracao produz um PLANO de implementacao via IA. Exportacao em ZIP de codigo nao existe nesta versao.'), out);
}
function exportJson(p) {
  const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })), download: (p.name || 'projeto').replace(/[^\w-]+/g, '_') + '.json' });
  document.body.append(a); a.click(); a.remove();
}
function saveDraft() {
  if (!draft.name.trim()) { toast('Defina o nome do produto para salvar.', true); return; }
  draft.updated = new Date().toISOString();
  const i = projects.findIndex(p => p.id === draft.id);
  if (i >= 0) projects[i] = JSON.parse(JSON.stringify(draft)); else projects.unshift(JSON.parse(JSON.stringify(draft)));
  if (persist()) toast('Rascunho salvo neste navegador (local, sem nuvem).');
}
function wizard() {
  return h('div', {}, h('h1', {}, 'Criar projeto'), h('div', { class: 'steps' }, STEPS.map((s, i) => h('span', { class: i <= step ? 'on' : '', title: s }))),
    h('p', { class: 'mut' }, `Etapa ${step + 1} de ${STEPS.length}: ${STEPS[step]}`),
    h('div', { class: 'wiz' }, h('div', { class: 'card' }, stepBody(),
      h('div', { class: 'row' }, h('button', { disabled: step === 0 ? '' : false, onclick: () => { step--; render(); } }, 'Voltar'), h('button', { onclick: saveDraft }, 'Salvar rascunho'),
        step < STEPS.length - 1 ? h('button', { class: 'pri', onclick: () => { step++; render(); } }, 'Proxima') : null)),
      h('div', {}, h('h2', {}, 'Previa'), previewFrame())));
}

/* ---------- Telas ---------- */
const NAV = [['home', 'Visao geral'], ['new', 'Criar projeto'], ['list', 'Meus projetos'], ['tpl', 'Templates'], ['cfg', 'Configuracoes'], ['help', 'Ajuda']];
function startNew(type) { draft = blank(type); step = type ? 1 : 0; plan = ''; view = 'new'; render(); }
function projCard(p) {
  return h('div', { class: 'card' }, h('b', {}, p.name), h('div', { class: 'mut' }, (TYPES.find(t => t[0] === p.type) || [])[1] + ' · ' + p.status), h('small', { class: 'mut' }, 'Atualizado: ' + new Date(p.updated).toLocaleString()),
    h('div', { class: 'row' },
      h('button', { onclick: () => { draft = JSON.parse(JSON.stringify(p)); step = 1; plan = ''; view = 'new'; render(); } }, 'Editar'),
      h('button', { onclick: () => { const c = JSON.parse(JSON.stringify(p)); c.id = uid(); c.name += ' (copia)'; c.created = c.updated = new Date().toISOString(); projects.unshift(c); persist(); render(); } }, 'Duplicar'),
      h('button', { onclick: () => exportJson(p) }, 'JSON'),
      h('button', { class: 'danger', onclick: () => { if (confirm(`Excluir "${p.name}"? Esta acao nao pode ser desfeita.`)) { projects = projects.filter(x => x.id !== p.id); persist(); render(); } } }, 'Excluir')));
}
function screen() {
  if (view === 'new') { if (!draft) draft = blank(); return wizard(); }
  if (view === 'list') return h('div', {}, h('h1', {}, 'Meus projetos'), projects.length ? h('div', { class: 'grid' }, projects.map(projCard)) : h('div', { class: 'card' }, 'Nenhum projeto ainda.'));
  if (view === 'tpl') return h('div', {}, h('h1', {}, 'Templates'), h('p', { class: 'mut' }, 'Iniciam o assistente com o tipo ja escolhido (sem conteudo pre-pronto).'), h('div', { class: 'grid' }, TEMPLATES.map(([t, n, d]) => h('div', { class: 'card' }, h('b', {}, n), h('div', { class: 'mut' }, d), h('div', { class: 'row' }, h('button', { class: 'pri', onclick: () => startNew(t) }, 'Usar'))))));
  if (view === 'cfg') return h('div', {}, h('h1', {}, 'Configuracoes'), h('div', { class: 'card' },
    [['Groq (IA)', cfg.groq, 'GROQ_API_KEY + GROQ_MODEL no .env (segredo, so servidor)'], ['ImgBB (imagens)', cfg.imgbb, 'IMGBB_API_KEY no .env (segredo, so servidor)'], ['Supabase', cfg.supabase, 'SUPABASE_URL + SUPABASE_ANON_KEY (publicos). Sincronizacao em nuvem ainda NAO implementada: os projetos ficam so no localStorage.']].map(([n, ok, how]) => h('p', {}, h('b', {}, n + ': '), h('span', { class: ok ? 'okc' : 'err' }, ok ? 'configurado' : 'nao configurado'), h('br'), h('small', { class: 'mut' }, how)))));
  if (view === 'help') return h('div', {}, h('h1', {}, 'Ajuda'), h('div', { class: 'card' }, h('p', {}, 'Crie um projeto, preencha as etapas e acompanhe a previa. Salve rascunhos (local) e exporte JSON. A geracao por IA produz um plano, nao um app pronto.'), h('p', { class: 'mut' }, 'Veja o README.md para configurar as integracoes.')));
  const recent = projects.slice(0, 3);
  return h('div', {}, h('h1', {}, 'Bem-vindo a Sellmart Factory'), h('p', { class: 'mut' }, 'Transforme sua ideia em um produto digital.'),
    h('div', { class: 'row' }, h('button', { class: 'pri', onclick: () => startNew() }, 'Criar novo projeto')),
    !cfg.groq || !cfg.imgbb || !cfg.supabase ? h('div', { class: 'card warn', style: 'margin:14px 0' }, 'Integracoes pendentes: ' + [!cfg.groq && 'Groq', !cfg.imgbb && 'ImgBB', !cfg.supabase && 'Supabase'].filter(Boolean).join(', ') + '. As ferramentas locais continuam funcionando.') : null,
    h('div', { class: 'card', style: 'margin:14px 0' }, h('b', {}, 'Projetos: '), String(projects.length)),
    h('h2', {}, 'Recentes'), recent.length ? h('div', { class: 'grid' }, recent.map(projCard)) : h('div', { class: 'card' }, 'Voce ainda nao criou nenhum projeto.'),
    h('h2', { style: 'margin-top:20px' }, 'Modelos disponiveis'), h('div', { class: 'grid' }, TEMPLATES.map(([t, n]) => h('div', { class: 'card opt', onclick: () => startNew(t) }, n))));
}
function render() {
  const nav = $('#nav'); nav.replaceChildren(...NAV.map(([id, n]) => h('button', { class: view === id ? 'on' : '', onclick: () => { view = id; if (id === 'new') { draft = blank(); step = 0; plan = ''; } $('#side').classList.remove('open'); render(); } }, n)));
  const c = $('#conn'); c.textContent = cfg.loaded ? (cfg.supabase ? 'Supabase configurado (sem sync ainda)' : 'Modo local (localStorage)') : 'Verificando...';
  $('#view').replaceChildren(screen());
}
$('#menu').addEventListener('click', () => $('#side').classList.toggle('open'));
render();
