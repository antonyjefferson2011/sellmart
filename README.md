# Sellmart Factory v0.1

Frontend: `index.html`, `style.css`, `script.js`. Backend (Express): `server/server.js`, `routes/generate.js` (Groq), `routes/upload.js` (ImgBB). O backend existe para manter as chaves secretas fora do navegador.

## Windows (PowerShell)
```
cd sellmart
npm install
copy .env.example .env
npm start
```
Abra http://localhost:3000 · Testes do backend: `npm test`

## Chaves
| Variavel | Tipo | Onde |
|---|---|---|
| GROQ_API_KEY, GROQ_MODEL | SECRETA / config | .env (servidor). Modelo: veja console.groq.com/docs/models |
| IMGBB_API_KEY | SECRETA | .env (servidor) |
| SUPABASE_URL, SUPABASE_ANON_KEY | PUBLICAS | .env (nunca use service_role) |

Supabase: rode `supabase.sql` (RLS ativo) no SQL Editor.

## Como testar
- Groq: preencha as 2 variaveis, reinicie, conclua o assistente e clique em "Gerar projeto".
- ImgBB: preencha a chave, reinicie, envie uma imagem na etapa Produtos.

## Falta
Login/Auth e sync com Supabase (so o SQL/RLS e a leitura de config existem); geracao de codigo e ZIP; sugestoes de texto por IA; testes automatizados do frontend (nao testado em navegador real); pagamentos.
