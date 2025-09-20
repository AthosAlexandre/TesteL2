# 🚀 TesteL2 — Backend (NestJS + Postgres + Docker)  

> **Empresa:** L2  
> **Descrição:** API para empacotamento de pedidos (caixas) com Swagger, Docker e teste unitário.  

---

## 📦 Stack
- **Node.js 20** + **NestJS 11**
- **TypeORM** + **PostgreSQL 16**
- **Swagger UI** para documentação (`/docs`)
- **Docker Compose** (API + DB)
- **Autenticação por API Key** (`x-api-key`)
- **Jest** para testes unitários

---

## ✅ Pré‑requisitos
> Para rodar com Docker (recomendado):
- Docker Desktop + Docker Compose
---

## 🧪 Como clonar o projeto
```bash
git clone <URL-DO-SEU-REPO>.git
cd TesteL2
```

---

## ⚙️ Configuração de ambiente
Na raiz do projeto existe um `.env.example`. Copie para `.env`:

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

> **OBS:** O avaliador **NÃO precisa instalar Node** localmente. Somente Docker.

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
- Clique em **Authorize** e informe seu `x-api-key` (se estiver habilitado).

4) **Endpoint principal:**
- `POST /orders/pack` → recebe `pedidos` e devolve caixas e alocação de produtos.

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
    ✓ should pack like expected (shape only) (7 ms)

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

> Dica: se o Jest reclamar que não encontrou testes, cheque se o arquivo `jest.config.ts` está na pasta `backend/` e se a pasta `test/` está sendo copiada no `Dockerfile`.

---

## 🔒 Sobre a API Key (403 — Forbidden)
- Se receber `{ "statusCode": 403, "message": "Forbidden resource" }`:
  - Verifique se `ENABLE_API_KEY=true` no `.env`.
  - Envie o header: `x-api-key: <valor de API_KEY>`.
  - API_KEY: `segredo-super-seguro`
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
│  │  │  └─ boxes.constant.ts  # Caixa 1/2/3
│  │  ├─ db/seed.ts            # Popular caixas
│  │  └─ orders/
│  │     ├─ dto/pack-orders.dto.ts
│  │     ├─ packing.service.ts
│  │     └─ orders.controller.ts
│  └─ test/
│     └─ packing.service.spec.ts
```

---

## 🧠 Como funciona (resumo técnico)
- O **PackingService** usa uma heurística *first‑fit decreasing* com **rotações** (permutações A/L/C) e uma checagem simples de **camadas** para evitar extrapolar dimensões.  
- Objetivo: **minimizar o número de caixas** e escolher a **menor caixa possível** onde o produto caiba.  
- Se um item não couber em nenhuma caixa disponível, retorna `caixa_id: null` com `observacao`.

---

## 🆘 Dúvidas comuns
- **Swagger abre mas retorna 403** → falta `x-api-key` ou `ENABLE_API_KEY=true`.  
- **Porta 3000 ocupada** → mude `PORT` no `.env` e reinicie.  
- **Seed não criou caixas** → verifique conexão com DB (`docker compose logs db`) e rode `npm run seed` novamente.

---

## 🏁 Pronto!
Com isso o avaliador da **L2** consegue:
- subir o backend com **Docker**,
- testar no **Swagger**,
- e executar o **teste unitário** com um comando.

Boa avaliação! ✨
