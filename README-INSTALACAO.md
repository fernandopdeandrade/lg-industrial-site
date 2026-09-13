# LG Industrial — Site Institucional + Painel Admin

Site da **LG Industrial** (Uruguaiana, RS): manutenção de máquinas agrícolas de última geração.
Stack: **React 19 + Tailwind + FastAPI + MongoDB**, com envio de e-mails via proxy de e-mail da Emergent.

---

## Requisitos

- **Node.js** 18+ e **yarn** (`npm install -g yarn`)
- **Python** 3.11+
- **MongoDB** rodando localmente (porta 27017) ou uma URL do MongoDB Atlas

---

## 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-local.txt   # lista enxuta, só o que o backend usa
cp .env.example .env             # e preencha os valores
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Variáveis do `backend/.env`

| Variável | Descrição |
|---|---|
| `MONGO_URL` | URL do MongoDB (ex: `mongodb://localhost:27017`) |
| `DB_NAME` | Nome do banco (ex: `lg_industrial`) |
| `FRONTEND_URL` | URL do frontend (ex: `http://localhost:3000`) |
| `JWT_SECRET` | Chave secreta do JWT (gere com `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | E-mail do administrador do painel |
| `ADMIN_PASSWORD` | Senha do administrador (redefinida a cada restart se mudar no .env) |
| `EMERGENT_EMAIL_KEY` | Chave do proxy de e-mail Emergent (necessária p/ envio de e-mails) |
| `EMAIL_FROM_NAME` | Nome exibido como remetente (`LG Industrial`) |
| `EMAIL_REPLY_TO` | Caixa de resposta (ex: `pupygreen@gmail.com`) |
| `OWNER_EMAIL` | E-mail que recebe contatos e orçamentos |

Na primeira execução o backend cria automaticamente: o usuário **admin** e **6 produtos de exemplo**.

## 2. Frontend (React)

```bash
cd frontend
yarn install
cp .env.example .env             # aponte REACT_APP_BACKEND_URL para o backend
yarn start
```

Abra `http://localhost:3000`.

### Variável do `frontend/.env`

| Variável | Descrição |
|---|---|
| `REACT_APP_BACKEND_URL` | URL do backend (ex: `http://localhost:8001` em desenvolvimento local) |

> Em produção, o backend responde sob o prefixo `/api` no mesmo domínio do frontend.

---

## 3. Acessos

| Área | URL | Credencial |
|---|---|---|
| Site | `/` | público |
| Painel admin | `/admin/login` | ver `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `backend/.env` |

No painel você gerencia **produtos**, **mensagens de contato** e **pedidos de orçamento**.

---

## Estrutura

```
backend/
  server.py            # API FastAPI: auth JWT, produtos, contato, orçamentos, e-mail
  requirements.txt
frontend/
  src/pages/           # Home, Servicos, Produtos, Sobre, Politica, Contato, admin/
  src/components/      # Layout, Marquee, QuoteDialog, animações (framer-motion + lenis)
  src/lib/             # api.js (axios), constants.js (contatos, imagens, serviços)
```

## Observações

- Sem o `EMERGENT_EMAIL_KEY` válido, contatos e orçamentos continuam salvos no banco e visíveis no painel — apenas o e-mail não é disparado.
- Para trocar textos, telefone ou imagens fixas do site: `frontend/src/lib/constants.js`.
- Banco de dados: tudo fica no MongoDB (`products`, `messages`, `quotes`, `users`).
