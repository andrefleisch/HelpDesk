# HelpDesk API

Backend de um sistema de Help Desk para cadastro de usuarios, autenticacao, abertura de tickets, comentarios e controle de atendimento por papeis.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- bcryptjs

## Funcionalidades

- Registro e login de usuarios.
- Autenticacao com JWT.
- Autorizacao por papeis (`USER`, `AGENT`, `ADMIN`).
- Criacao e listagem de tickets.
- Atualizacao de status, prioridade e responsavel do ticket por agente ou admin.
- Criacao e listagem de comentarios em tickets.
- Gerenciamento de usuarios por admin.
- Tratamento global de erros com `AppError` e middleware de erro.
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
routes -> middlewares -> controllers -> services -> repositories -> Prisma -> PostgreSQL
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

Lista tickets.

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

Backend funcional com autenticacao, autorizacao, tickets, comentarios e gerenciamento de usuarios.

Proximos passos possiveis:

- adicionar testes automatizados;
- melhorar filtros e paginacao;
- criar frontend;
- adicionar documentacao OpenAPI/Swagger.
