# 🚀 TesteL2 — Backend (NestJS + Postgres + Docker) & Frontend (React + Vite + Ant Design)

> **Empresa:** L2  
> **Descrição:** Solução completa com **API** de empacotamento de pedidos (caixas) e **Frontend** React para montar pedidos, visualizar itens e enviar o empacotamento ao backend. Inclui Swagger, Docker e teste unitário.

---

## 🧭 Sumário
- [📦 Backend](#-backend)
  - [Stack](#stack)
  - [Pré-requisitos](#-prérequisitos)
  - [Clonar](#-como-clonar-o-projeto)
  - [Ambiente (.env)](#-configuração-de-ambiente)
  - [Subir com Docker](#-subindo-com-docker-modo-recomendado)
  - [Endereços úteis](#-endereços-úteis)
  - [Teste unitário (Jest)](#-teste-unitário-jest)
  - [API Key (403)](#-sobre-a-api-key-403--forbidden)
  - [Estrutura](#-estrutura-resumo)
  - [Como funciona (técnico)](#-como-funciona-resumo-técnico)
- [💻 Frontend](#-frontend)
  - [Stack](#stack-1)
  - [Pré-requisitos](#-prérequisitos-1)
  - [Ambiente (.env)](#-ambiente-env-frontend)
  - [Instalar & rodar](#-instalar--rodar-frontend)
  - [Como usar](#-como-usar)
  - [Estrutura](#-estrutura-frontend)
  - [Build de produção](#-build-de-produção)
  - [Dicas e problemas comuns](#-dicas-e-problemas-comuns)

---

# 📦 Backend

## Stack
- **Node.js 20** + **NestJS 11**
- **TypeORM** + **PostgreSQL 16**
- **Swagger UI** (`/docs`)
- **Docker Compose** (API + DB)
- **Autenticação por API Key** (`x-api-key`)
- **Jest** para testes unitários

---

## ✅ Pré-requisitos
Para rodar com Docker (recomendado):
- Docker Desktop + Docker Compose

---

## 🧪 Como clonar o projeto
```bash
git clone <URL-DO-SEU-REPO>.git
cd TesteL2
```

---

## ⚙️ Configuração de ambiente
Na **raiz** do projeto existe um `.env.example`. Copie para `.env`:

```bash
cp .env.example .env
```

Valores padrão (podem ser alterados):
```dotenv
# Postgres
DB_HOST=db
DB_PORT=5432
DB_USER=smuser
DB_PASS=smpass
DB_NAME=smpack

# API
PORT=3000
ENABLE_API_KEY=true
API_KEY=segredo-super-seguro

# SWAGGER
SWAGGER_TITLE=API Empacotamento Seu Manoel
SWAGGER_DESC=Recebe pedidos e retorna caixas e alocação de produtos
```

> 🔐 Se `ENABLE_API_KEY=true`, todas as chamadas exigem o header `x-api-key` com o valor configurado em `API_KEY`.

---

## 🐳 Subindo com Docker (modo recomendado)
> O avaliador **NÃO precisa instalar Node** localmente. Apenas Docker.

1) **Build e subir os serviços** (API + DB):
```bash
docker compose build
docker compose up -d
```

2) **Popular as caixas padrão (seed):**
```bash
docker compose exec api npm run seed
# Saída esperada: "Boxes seed ok"
```

3) **Acessar o Swagger:**
- URL: **http://localhost:3000/docs**
- Clique em **Authorize** e informe seu `x-api-key` (se habilitado).
- API_KEY=`segredo-super-seguro`

4) **Endpoint principal:**
- `POST /orders/pack` → recebe `pedidos` e devolve caixas/alocação.

Exemplo rápido (cURL):
```bash
curl -X POST "http://localhost:3000/orders/pack" \
  -H "Content-Type: application/json" \
  -H "x-api-key: segredo-super-seguro" \
  -d '{"pedidos":[{"pedido_id":1,"produtos":[{"produto_id":"Item A","dimensoes":{"altura":10,"largura":10,"comprimento":10}}]}]}'
```

---

## 🧭 Endereços úteis
- 📘 **Swagger:** http://localhost:3000/docs  
- 🔌 **Endpoint:** `POST /orders/pack`  
- 🗄️ **Banco:** PostgreSQL (config. em `.env`)

---

## 🧪 Teste unitário (Jest)

Este projeto contém um teste unitário do **PackingService**.

### Rodar o teste **no Docker** (recomendado)
```bash
docker compose exec api npx jest -c jest.config.ts test/packing.service.spec.ts
```

Saída esperada (exemplo):
```
PASS  test/packing.service.spec.ts
  PackingService
    ✓ should pack like expected (shape only)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

### Rodar todos os testes
```bash
docker compose exec api npm test
```

### Rodar com cobertura
```bash
docker compose exec api npm run test:cov
```

> Se o Jest reclamar que não encontrou testes, cheque se `jest.config.ts` e a pasta `test/` estão sendo copiados no `Dockerfile`.

---

## 🔒 Sobre a API Key (403 — Forbidden)
Se receber `{ "statusCode": 403, "message": "Forbidden resource" }`:
- Verifique se `ENABLE_API_KEY=true` no `.env`.
- Envie o header: `x-api-key: <valor de API_KEY>`.
- Reinicie a API após mudar `.env`:
  ```bash
  docker compose restart api
  ```
- Para **desativar** a API key durante testes:
  ```dotenv
  ENABLE_API_KEY=false
  ```

---

## 🗂️ Estrutura (resumo)
```
TesteL2/
├─ docker-compose.yml
├─ .env.example  (.env)
├─ backend/
│  ├─ Dockerfile
│  ├─ jest.config.ts
│  ├─ src/
│  │  ├─ main.ts               # Swagger + bootstrap
│  │  ├─ app.module.ts         # TypeORM + módulos
│  │  ├─ common/guards/api-key.guard.ts
│  │  ├─ boxes/
│  │  │  ├─ box.entity.ts
│  │  │  └─ boxes.constant.ts  # Caixa 1/2/3 (seed)
│  │  ├─ db/seed.ts            # Popular caixas
│  │  └─ orders/
│  │     ├─ dto/pack-orders.dto.ts
│  │     ├─ packing.service.ts
│  │     └─ orders.controller.ts
│  └─ test/
│     └─ packing.service.spec.ts
```
  
---

# 💻 Frontend

## Stack
- **React 18/19 + Vite**
- **React Router DOM**
- **Ant Design v5** (com **@ant-design/v5-patch-for-react-19**)
- **Context API** para:
  - **Auth** (email + API Key, rota protegida)
  - **Packing** (pedidos, itens, carrinho)
- **Páginas**:
  - **Login** (validação de e-mail, guarda de sessão e API Key)
  - **Home** (catálogo com busca, paginação, múltiplos pedidos)
  - **Carrinho** (abas por pedido, tabela responsiva, envio para `/orders/pack`)

---

## ✅ Pré-requisitos
- Node 18+ (apenas se quiser rodar o frontend localmente sem Docker do backend)

> O **backend** precisa estar rodando em `http://localhost:3000` (ou ajuste o `.env` do frontend).

---

## ⚙️ Ambiente (.env) — Frontend
Dentro de `frontend/teste-l2/` crie um arquivo **`.env`**:

```dotenv
# URL do backend NestJS
VITE_BACKEND_URL=http://localhost:3000

# API Key padrão (opcional). Se não definir aqui, você pode informar no login.
VITE_API_KEY=segredo-super-seguro
```

> Se `ENABLE_API_KEY=true` no backend, o frontend envia `x-api-key` da **sessão** (preenchida no login) ou, se não houver, tenta `VITE_API_KEY`.

---

## 📥 Instalar & rodar (Frontend)
```bash
cd frontend/teste-l2
npm install
npm run dev
```

Abrirá em: **http://localhost:5173**

---

## 🧑‍💻 Como usar
1. **Login**: informe um **e-mail válido** (tem verificação `@`) e, se quiser, a **API Key**.  
   - A sessão guarda `email` e `apiKey` no `localStorage`.
2. **Home**:
   - Busque por produtos, use **paginação**.
   - Crie **múltiplos pedidos** (botão “Novo Pedido”) e selecione o pedido ativo (Segmented).
   - Clique em **Adicionar** para enviar o produto ao **pedido ativo**.
3. **Topbar**:
   - Mostra seu e-mail, botão **Empacotamentos** (carrinho) e **Sair**.
4. **Carrinho**:
   - Abas por pedido.
   - Tabelas **responsivas** (colapsam dimensões no mobile).
   - Botão **Confirmar empacotamento** → envia **TODOS** os pedidos para o endpoint `/orders/pack`.
   - A resposta do backend aparece em um **JSON** formatado na tela.

---

## 🗂️ Estrutura (Frontend)
```
frontend/teste-l2/
├─ src/
│  ├─ auth/
│  │  ├─ AuthContext.tsx        # sessão (email + apiKey)
│  │  └─ ProtectedRoute.tsx     # rota protegida
│  ├─ packing/
│  │  └─ PackingContext.tsx     # múltiplos pedidos, carrinho
│  ├─ components/
│  │  └─ top-bar/Topbar.tsx     # topo com Home, carrinho e sair
│  ├─ views/
│  │  ├─ login/                  # tela de login (AntD Form)
│  │  ├─ home/                   # catálogo (cards, busca, paginação, pedidos)
│  │  └─ cart/                   # carrinho (abas, tabela responsiva)
│  ├─ data/
│  │  └─ products.ts             # produtos mock com dimensões e imagens
│  ├─ api.ts                     # fetch POST /orders/pack com x-api-key
│  ├─ types.ts                   # tipos (Produto, Pedido, etc.)
│  ├─ App.tsx                    # rotas + providers
│  └─ main.tsx                   # Vite + AntD App + BrowserRouter
└─ .env                          # VITE_BACKEND_URL / VITE_API_KEY
```

---

## 🏗️ Build de produção
```bash
cd frontend/teste-l2
npm run build
npm run preview   # opcional, para testar o build localmente
```

---

## 🛟 Dicas e problemas comuns
- **403 no carrinho**: verifique se o backend exige API Key e se a sessão possui uma (`Login`) ou se `VITE_API_KEY` está definida.
- **.env do frontend não surte efeito**: confirme que o arquivo está em **`frontend/teste-l2/.env`** e reinicie `npm run dev`.
- **CORS/failed to fetch**: garanta que o backend está em execução e acessível no host/porta configurados em `VITE_BACKEND_URL`.
- **Tabs apertadas no mobile**: elas são roláveis horizontalmente; arraste lateralmente.

---
