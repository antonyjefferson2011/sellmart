# Sellmart — guia de instalação

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Vitrine pública. Lê em tempo real só os produtos **publicados**. |
| `painel.html` | Painel do administrador (login, cadastro, edição, exclusão, upload de capa). |
| `config.js` | **Único lugar** onde você preenche Firebase, ImgBB e contato do rodapé. |
| `util.js` | Funções compartilhadas (card de produto, formatação de preço, validação de links). |
| `sellmart.css` | Identidade visual compartilhada pelas duas páginas. |
| `firestore.rules` | Regras de segurança para colar no Firestore. |
| `logo-sellmart.png` | **Você adiciona:** salve sua logo com este nome na mesma pasta (não foi anexada nesta conversa). Se o arquivo for JPG/SVG, troque a extensão nas tags `<img>` dos dois HTMLs. |

## 1. Firebase

1. Acesse https://console.firebase.google.com e crie um projeto.
2. **Authentication → Sign-in method →** ative **E-mail/senha**. Em *Settings → User actions*, desative o cadastro por conta própria, se a opção existir.
3. **Firestore Database → Criar banco** (modo de produção; escolha a região mais próxima).
4. **Firestore → Regras:** apague o conteúdo, cole o de `firestore.rules` e clique em **Publicar**.
5. **Configurações do projeto → Seus apps → Web (`</>`)**: registre o app e copie os valores para `config.js`, na seção `CONFIGURAÇÃO FIREBASE — PREENCHA AQUI` (`apiKey`, `authDomain`, `projectId`, `storageBucket` opcional, `messagingSenderId`, `appId`).

**Público ou privado?** Esses valores do Firebase aparecem em qualquer site que o use e **não são segredo**; a proteção vem do Authentication e das regras. Mantenha privados: senha do admin, contas de serviço/chaves privadas (nunca coloque no front-end) e o acesso ao seu console.

## 2. Primeiro administrador

1. **Authentication → Users → Add user:** crie e-mail e senha fortes.
2. Copie o **UID** do usuário criado.
3. **Firestore → Iniciar coleção** `admins` → ID do documento = **o UID copiado**, com um campo qualquer (ex.: `ativo` = `true`).

Sem esse documento, o login funciona, mas o painel recusa a conta e as regras bloqueiam qualquer escrita. Para remover um admin, apague o documento.

## 3. ImgBB

1. Crie uma conta em https://imgbb.com e gere a chave em https://api.imgbb.com/.
2. Cole em `config.js`, na seção `CONFIGURAÇÃO IMGBB — PREENCHA AQUI`.

**Aviso:** a chave fica em JavaScript público e **pode ser vista** por quem abrir o código. Não é um segredo protegido. Se alguém abusar dela, gere outra no ImgBB e substitua. Só quem está logado consegue usar o painel, mas a chave em si continua visível no arquivo.

## 4. Testar localmente

Os módulos JavaScript **não funcionam abrindo o arquivo com duplo clique** (`file://`). Na pasta do projeto, rode um servidor local:

```
python3 -m http.server 8000
```
(ou `npx serve`). Abra `http://localhost:8000` e `http://localhost:8000/painel.html`. O `localhost` já é domínio autorizado no Firebase.

Roteiro: entre no painel → cadastre um produto como **Publicado** → abra `index.html` e veja-o aparecer sem recarregar → edite o preço → mude para **Rascunho** e confira que some da vitrine.

## 5. Publicar

Qualquer hospedagem estática serve. Opção recomendada, **Firebase Hosting**:

```
npm i -g firebase-tools
firebase login
firebase init hosting     # pasta pública: a do projeto; não sobrescreva index.html
firebase deploy
```
Alternativas: Netlify, Cloudflare Pages, GitHub Pages (arraste/envie a pasta). Depois de publicar, adicione seu domínio em **Authentication → Settings → Authorized domains** (o domínio `*.web.app` do Firebase Hosting já vem autorizado). Opcional: no Google Cloud Console → *Credenciais*, restrinja a API key do Firebase por referenciador HTTP ao seu domínio.

O link `painel.html` não é secreto e não precisa ser: ele está protegido por login + regras.

## 6. Conferir se o painel está protegido

1. **Sem login:** abra `painel.html` em aba anônima. Só deve aparecer a tela de entrada.
2. **Conta sem permissão:** crie outro usuário no Authentication **sem** documento em `admins`. Ao entrar, o painel deve recusar.
3. **Regras no servidor:** no Firestore → Regras → **Simulador de regras**, teste como *não autenticado*: `get /produtos/ID` de um rascunho = negado; `create` / `update` / `delete` = negado. Como usuário autenticado sem doc em `admins`: escrita = negada. Com o UID do admin: escrita válida = permitida.
4. **Console do navegador (aba anônima da vitrine):** tentar gravar com o SDK deve retornar `permission-denied`.
5. Rascunhos nunca devem aparecer em `index.html`.

## Observações

- Não há produtos de demonstração: a vitrine mostra “Novos produtos em breve” enquanto estiver vazia.
- Os botões **Comprar** abrem em nova aba o link de checkout cadastrado; o site não processa pagamentos.
- Para trocar a lista de categorias, edite `CATEGORIAS` em `config.js` **e** a lista na função `produtoValido` do `firestore.rules`, depois publique as regras de novo.
