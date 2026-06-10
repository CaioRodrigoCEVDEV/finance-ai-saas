# Frontend

Aplicação React com Vite e Tailwind CSS para o Finance AI.

O frontend usa autenticacao por cookie `httpOnly`, portanto as chamadas para a API devem usar `withCredentials: true`.

## Configuração

1. Crie o arquivo `frontend/.env` com base em `frontend/.env.example`.
2. Defina a URL da API backend:

```env
VITE_API_URL=http://localhost:3333
```

## Scripts

- `npm run dev`: inicia o frontend na porta `5173`
- `npm run build`: gera o build de produção
- `npm run preview`: visualiza o build localmente

## Como rodar

1. Instale as dependências com `npm install`
2. Garanta que o backend esteja rodando em `http://localhost:3333`
3. Inicie o frontend com `npm run dev`
4. Acesse `http://localhost:5173`

## Rotas

- `/`: landing page com CTA para o dashboard
- `/login`: tela de autenticacao
- `/dashboard`: dashboard financeiro protegido por sessao

Se o usuario nao estiver autenticado, `/dashboard` redireciona para `/login`.
Se o usuario ja estiver autenticado, `/login` redireciona para `/dashboard`.

## Login demo

- email: `admin@financeai.com`
- senha: `123456`

## Endpoints consumidos

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /dashboard/summary`
- `GET /dashboard/expenses-by-category`
- `GET /dashboard/recent-transactions`
- `GET /dashboard/monthly-flow`

## Estrutura

- `src/layouts`: layouts base
- `src/pages`: páginas
- `src/routes`: configuração das rotas
- `src/services`: camada de API
- `src/components`: componentes reutilizáveis
- `src/components/dashboard`: componentes específicos do dashboard
- `src/utils`: utilitários de formatação
