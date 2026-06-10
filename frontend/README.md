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
- `/accounts`: tela protegida para CRUD de contas financeiras
- `/credit-cards`: tela protegida para CRUD de cartoes de credito
- `/transactions`: tela protegida para CRUD de transacoes
- `/categories`: tela protegida para CRUD de categorias

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
- `GET /accounts`
- `GET /accounts/:id`
- `POST /accounts`
- `PUT /accounts/:id`
- `DELETE /accounts/:id`
- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /credit-cards`
- `GET /credit-cards/:id`
- `POST /credit-cards`
- `PUT /credit-cards/:id`
- `DELETE /credit-cards/:id`
- `GET /transactions`
- `GET /transactions/:id`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /transactions/summary/month`

## Estrutura

- `src/layouts`: layouts base
- `src/pages`: páginas
- `src/routes`: configuração das rotas
- `src/services`: camada de API
- `src/components`: componentes reutilizáveis
- `src/components/dashboard`: componentes específicos do dashboard
- `src/components/accounts`: componentes da tela de contas
- `src/components/creditCards`: componentes da tela de cartoes
- `src/components/transactions`: componentes da tela de transacoes
- `src/components/categories`: componentes da tela de categorias
- `src/utils`: utilitários de formatação

## Tela de contas

A rota `/accounts` fica protegida pela mesma sessao do dashboard e oferece:

- listagem de contas ativas do tenant atual
- criacao de nova conta com formulario inline
- edicao de conta existente
- exclusao com confirmacao
- atualizacao automatica da lista apos criar, editar ou excluir

O menu superior do layout autenticado agora possui links para `Dashboard` e `Contas`.

## Tela de transacoes

A rota `/transactions` fica protegida pela mesma sessao do dashboard e oferece:

- cards com resumo mensal de receitas, despesas, investimentos e saldo
- filtros por descricao, tipo, status, conta, categoria e periodo
- listagem responsiva com tabela no desktop e cards no mobile
- criacao e edicao em modal
- destaque visual de conta ou cartao conforme metodo de pagamento
- atualizacao automatica da lista e do resumo apos criar, editar ou excluir
- exclusao com confirmacao

O menu lateral do layout autenticado agora possui links para `Dashboard`, `Contas`, `Transacoes` e `Categorias`.

## Tela de cartoes

A rota `/credit-cards` fica protegida pela mesma sessao do dashboard e oferece:

- resumo com limite total, uso no mes, limite disponivel e quantidade de cartoes ativos
- listagem em grid com cards visuais de cartao premium
- criacao e edicao em modal
- exclusao com confirmacao
- integracao com contas do tenant atual para vinculo opcional
- atualizacao automatica da lista apos criar, editar ou excluir

O menu lateral do layout autenticado agora possui links para `Dashboard`, `Contas`, `Cartoes`, `Transacoes` e `Categorias`.

## Tela de categorias

A rota `/categories` fica protegida pela mesma sessao do dashboard e oferece:

- filtros por tipo
- listagem conjunta de categorias padrao e personalizadas do tenant atual
- criacao e edicao de categorias personalizadas
- seletor opcional de categoria pai
- bloqueio visual de edicao e exclusao para categorias padrao
- atualizacao automatica da lista apos criar, editar ou excluir

O menu superior do layout autenticado agora possui links para `Dashboard`, `Contas` e `Categorias`.
## Telas disponiveis

- `/dashboard`
- `/accounts`
- `/credit-cards`
- `/transactions`
- `/categories`

## Cartoes de credito

- pagina protegida em `/credit-cards`
- resumo com limite total, utilizado no mes, limite disponivel e quantidade de cartoes ativos
- cards premium com conta vinculada, bandeira, fechamento, vencimento, status e barra de uso do limite
- formulario em modal para criar e editar cartoes
- integracao com `creditCardService` para listar, detalhar, criar, atualizar e excluir
- a tela de transacoes passa a carregar cartoes reais e permite selecionar um cartao quando `paymentMethod = CREDIT_CARD`
