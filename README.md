# HelpDesk API

Backend de um sistema de Help Desk para cadastro de usuarios, autenticacao, abertura de tickets, comentarios e controle de atendimento por papeis.

![Backend CI](https://github.com/andrefleisch/HelpDesk/actions/workflows/backend-ci.yml/badge.svg)

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- bcryptjs
- Jest
- Supertest
- OpenAPI/Swagger
- GitHub Actions

## Funcionalidades

- Registro e login de usuarios.
- Rota para consultar usuario autenticado (`GET /auth/me`).
- Autenticacao com JWT.
- Autorizacao por papeis (`USER`, `AGENT`, `ADMIN`).
- Protecao contra acesso direto indevido a tickets de outros usuarios.
- Criacao, busca e listagem de tickets.
- Filtros e paginacao na listagem de tickets.
- Atualizacao de status, prioridade e responsavel do ticket por agente ou admin.
- Cancelamento de ticket com regras de permissao.
- Criacao e listagem de comentarios em tickets.
- Gerenciamento de usuarios por admin.
- Validacao de entrada com Zod.
- Tratamento global de erros com `AppError` e middleware de erro.
- Documentacao da API com OpenAPI/Swagger.
- Testes e2e com Jest e Supertest.
- CI com GitHub Actions.
- Seed para criar o primeiro usuario admin.

## Estrutura do backend

```text
backend/src
  app.ts
  server.ts
  errors/
  middlewares/
  modules/
    auth/
    users/
    tickets/
    comments/
  prisma/
```

O fluxo principal segue a separacao:

```text
routes -> middlewares -> controllers -> schemas -> services -> repositories -> Prisma -> PostgreSQL
```

## Requisitos

- Node.js
- PostgreSQL
- npm

## Variaveis de ambiente

Crie um arquivo `.env` dentro de `backend`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/helpdesk?schema=public"
AUTH_SECRET="sua_chave_secreta"
PORT=3000
```

## Como rodar localmente

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependencias:

```bash
npm install
```

Valide o schema do Prisma:

```bash
npx prisma validate --schema src/prisma/schema.prisma
```

Rode as migrations:

```bash
npx prisma migrate dev --schema src/prisma/schema.prisma
```

Crie o primeiro admin:

```bash
npm run seed
```

Inicie o servidor:

```bash
npm run dev
```

A API roda por padrao em:

```text
http://localhost:3000
```

A documentacao Swagger fica em:

```text
http://localhost:3000/docs
```

## Scripts

```bash
npm run dev
```

Roda a API em desenvolvimento.

```bash
npm run build
```

Compila o TypeScript.

```bash
npm run start
```

Roda a versao compilada.

```bash
npm run seed
```

Cria ou atualiza o usuario admin inicial.

```bash
npm test
```

Roda os testes automatizados do backend.

Os testes atuais sao testes de integracao HTTP, entao precisam do PostgreSQL rodando e do `DATABASE_URL` configurado no `.env`.

## Usuario admin inicial

O seed cria o seguinte usuario:

```text
email: admin@helpdesk.com
senha: admin123
role: ADMIN
```

Use esse usuario para fazer login e acessar rotas administrativas.

## Autenticacao

Rotas protegidas exigem o header:

```http
Authorization: Bearer TOKEN
```

O token e gerado no login ou registro.

## Papeis

```text
USER
```

Usuario comum. Pode criar tickets e comentarios.

```text
AGENT
```

Atendente. Pode alterar status, prioridade e responsavel de tickets.

```text
ADMIN
```

Administrador. Pode gerenciar usuarios e tambem executar acoes de atendimento.

## Endpoints

### Docs

```http
GET /docs
```

Abre a documentacao visual da API com Swagger.

### Health

```http
GET /health
```

Verifica se a API esta rodando.

### Auth

```http
POST /auth/register
```

Cria um usuario comum e retorna token.

Body:

```json
{
  "name": "Usuario",
  "email": "user@email.com",
  "password": "user123"
}
```

```http
POST /auth/login
```

Faz login e retorna token.

Body:

```json
{
  "email": "admin@helpdesk.com",
  "password": "admin123"
}
```

```http
GET /auth/me
```

Retorna o usuario autenticado usando o token JWT enviado no header `Authorization`.

### Users

Todas as rotas de users exigem `ADMIN`.

```http
GET /users
```

Lista usuarios.

```http
GET /users/:id
```

Busca usuario por id.

```http
POST /users
```

Cria usuario com role definido por admin.

Body:

```json
{
  "name": "Agente HelpDesk",
  "email": "agent@helpdesk.com",
  "password": "agent123",
  "role": "AGENT"
}
```

### Tickets

Todas as rotas de tickets exigem usuario autenticado.

```http
GET /tickets
```

Lista tickets com filtros e paginacao.

Query params opcionais:

```text
status
priority
createdById
assignedToId
page
limit
```

```http
GET /tickets/:id
```

Busca ticket por id.

```http
POST /tickets
```

Cria ticket. O `createdById` vem do token, nao do body.

Body:

```json
{
  "title": "Problema no notebook",
  "description": "Notebook nao liga",
  "priority": "HIGH"
}
```

```http
PATCH /tickets/:id/status
```

Atualiza status. Exige `AGENT` ou `ADMIN`.

Body:

```json
{
  "status": "IN_PROGRESS"
}
```

O status `CANCELED` nao e aceito nessa rota. Cancelamento tem rota propria para aplicar regras especificas.

```http
PATCH /tickets/:id/cancel
```

Cancela ticket.

Regras:

- `USER` pode cancelar apenas tickets criados por ele.
- `AGENT` e `ADMIN` podem cancelar qualquer ticket.
- ticket resolvido nao pode ser cancelado.
- ticket ja cancelado nao pode ser cancelado novamente.

```http
PATCH /tickets/:id/priority
```

Atualiza prioridade. Exige `AGENT` ou `ADMIN`.

Body:

```json
{
  "priority": "MEDIUM"
}
```

```http
PATCH /tickets/:id/assign
```

Atribui responsavel. Exige `AGENT` ou `ADMIN`.

Body:

```json
{
  "assignedToId": "id-do-usuario"
}
```

### Comments

Todas as rotas de comments exigem usuario autenticado.

Usuarios comuns so podem criar e listar comentarios de tickets criados por eles.

Agentes e admins podem acessar comentarios de qualquer ticket.

```http
POST /comments/:ticketId/comments
```

Cria comentario em um ticket. O `authorId` vem do token, nao do body.

Body:

```json
{
  "content": "Comentario sobre o andamento do ticket."
}
```

```http
GET /comments/:ticketId/comments
```

Lista comentarios de um ticket.

## Exemplos com curl

Login admin:

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@helpdesk.com","password":"admin123"}'
```

Listar usuarios com token admin:

```bash
curl http://localhost:3000/users -H "Authorization: Bearer TOKEN_ADMIN"
```

Criar agente:

```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_ADMIN" -d '{"name":"Agente HelpDesk","email":"agent@helpdesk.com","password":"agent123","role":"AGENT"}'
```

Criar ticket:

```bash
curl -X POST http://localhost:3000/tickets -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"title":"Problema no notebook","description":"Notebook nao liga","priority":"HIGH"}'
```

Atualizar status do ticket:

```bash
curl -X PATCH http://localhost:3000/tickets/ID_DO_TICKET/status -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_AGENT" -d '{"status":"IN_PROGRESS"}'
```

Consultar usuario autenticado:

```bash
curl http://localhost:3000/auth/me -H "Authorization: Bearer TOKEN"
```

Listar tickets com filtros e paginacao:

```bash
curl "http://localhost:3000/tickets?status=OPEN&page=1&limit=10" -H "Authorization: Bearer TOKEN"
```

Cancelar ticket:

```bash
curl -X PATCH http://localhost:3000/tickets/ID_DO_TICKET/cancel -H "Authorization: Bearer TOKEN"
```

## Tratamento de erros

O projeto usa:

- `AppError` para erros esperados da aplicacao.
- `errorMiddleware` para centralizar respostas de erro.
- `ZodError` para erros de validacao.

Exemplos:

```text
400 - Dados invalidos
401 - Nao autenticado
403 - Sem permissao
404 - Recurso nao encontrado
409 - Conflito, como email ja cadastrado
500 - Erro interno inesperado
```

## Status do projeto

Backend MVP funcional com autenticacao, autorizacao, tickets, comentarios, gerenciamento de usuarios, validacao, tratamento de erros, documentacao, testes e CI.

Proximos passos possiveis:

- criar frontend;
- decidir estrategia de deploy;
- melhorar empacotamento da documentacao Swagger para producao;
- adicionar logs estruturados;
- adicionar refresh token.
