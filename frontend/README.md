# HelpDesk Frontend

Interface web do sistema HelpDesk, integrada a API REST do projeto.

## Stack

- React
- TypeScript
- React Router
- Axios
- Bootstrap
- Vite

## Funcionalidades atuais

- Login com email e senha.
- Persistencia do token JWT no navegador.
- Recuperacao do usuario autenticado com `GET /auth/me`.
- Protecao de rotas para usuarios autenticados.
- Dashboard com dados do usuario.
- Listagem e criacao de tickets.
- Visualizacao dos detalhes de um ticket.
- Criacao e listagem de comentarios.
- Atualizacao de status e prioridade por agente ou administrador.

## Organizacao

```text
src/
  contexts/   estado global de autenticacao
  pages/      telas da aplicacao
  routes/     protecao de rotas
  services/   chamadas HTTP com Axios
  types/      contratos TypeScript da API
  App.tsx     declaracao das rotas
  main.tsx    inicializacao do React
```

As paginas nao fazem requisicoes diretamente. Elas chamam funcoes da camada de `services`, que usa a instancia compartilhada do Axios. Um interceptor adiciona o token ao header `Authorization` das requisicoes protegidas.

```text
pagina -> service -> Axios/interceptor -> backend
```

## Requisitos

- Node.js
- npm
- Backend do HelpDesk rodando

## Variavel de ambiente

Crie um arquivo `.env` dentro de `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

Se essa variavel nao for definida, a aplicacao usa `http://localhost:3000` como API.

## Como executar

```bash
cd frontend
npm install
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

O backend deve estar rodando em outro terminal. Consulte o README da raiz para configurar PostgreSQL, migrations e seed.

## Scripts

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

```bash
npm run build
```

Valida o TypeScript e gera a versao de producao.

```bash
npm run lint
```

Verifica problemas de qualidade e padronizacao no codigo.

```bash
npm run preview
```

Executa localmente a versao gerada pelo build.

## Autenticacao

Depois do login, o backend devolve `token` e `user` no body da resposta. O frontend salva o token em `localStorage` com a chave `helpdesk.token`.

Antes de uma chamada HTTP, o interceptor recupera esse token e adiciona:

```http
Authorization: Bearer TOKEN
```

Ao recarregar a pagina, o `AuthProvider` usa o token salvo para consultar `/auth/me`. Se o token for invalido ou estiver expirado, a sessao local e removida.

## Usuario de desenvolvimento

Depois de executar o seed do backend:

```text
email: admin@helpdesk.com
senha: admin123
```

Essas credenciais sao destinadas somente ao ambiente local de desenvolvimento.
