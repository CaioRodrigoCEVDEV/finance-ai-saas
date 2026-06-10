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
- `/budgets`: tela protegida para CRUD de orcamentos mensais
- `/goals`: tela protegida para CRUD de metas financeiras
- `/transactions`: tela protegida para CRUD de transacoes
- `/categories`: tela protegida para CRUD de categorias
- `/categorization-rules`: tela protegida para CRUD de regras de categorizacao automatica
- `/imports`: tela protegida para importar extratos CSV ou OFX

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
- `GET /budgets`
- `GET /budgets/:id`
- `POST /budgets`
- `PUT /budgets/:id`
- `DELETE /budgets/:id`
- `GET /budgets/summary/month`
- `GET /goals`
- `GET /goals/:id`
- `POST /goals`
- `PUT /goals/:id`
- `PATCH /goals/:id/progress`
- `DELETE /goals/:id`
- `GET /goals/summary`
- `GET /transactions`
- `GET /transactions/:id`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /transactions/summary/month`
- `POST /imports/preview`
- `POST /imports/confirm`
- `GET /categorization-rules`
- `GET /categorization-rules/:id`
- `POST /categorization-rules`
- `PUT /categorization-rules/:id`
- `DELETE /categorization-rules/:id`
- `POST /categorization-rules/test`
- `POST /categorization-rules/apply`

## Estrutura

- `src/layouts`: layouts base
- `src/pages`: páginas
- `src/routes`: configuração das rotas
- `src/services`: camada de API
- `src/components`: componentes reutilizáveis
- `src/components/dashboard`: componentes específicos do dashboard
- `src/components/accounts`: componentes da tela de contas
- `src/components/creditCards`: componentes da tela de cartoes
- `src/components/budgets`: componentes da tela de orcamentos
- `src/components/goals`: componentes da tela de metas
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

## Tela de orcamentos

A rota `/budgets` fica protegida pela mesma sessao do dashboard e oferece:

- resumo do mes com orcamento total, utilizado, disponivel e percentual usado
- filtros por mes, ano e categoria
- listagem em grid responsivo com cards por categoria
- criacao e edicao em modal
- exclusao com confirmacao
- carga de categorias reais do tenant filtradas para `EXPENSE`
- calculo de uso com base nas transacoes confirmadas do mesmo mes
- atualizacao automatica da lista e do resumo apos criar, editar ou excluir

O menu lateral do layout autenticado agora possui links para `Dashboard`, `Contas`, `Cartoes`, `Orcamentos`, `Metas`, `Transacoes` e `Categorias`.

## Tela de metas

A rota `/goals` fica protegida pela mesma sessao do dashboard e oferece:

- resumo com total de metas, metas ativas, metas concluidas e progresso geral
- filtros por status e busca por nome ou descricao
- listagem em grid responsivo com cards de meta
- criacao e edicao em modal
- modal exclusivo para atualizar progresso rapidamente
- conclusao automatica ao atingir valor alvo
- exclusao com confirmacao
- atualizacao automatica da lista e do resumo apos criar, editar, atualizar progresso ou excluir

## Tela de categorias

A rota `/categories` fica protegida pela mesma sessao do dashboard e oferece:

- filtros por tipo
- listagem conjunta de categorias padrao e personalizadas do tenant atual
- criacao e edicao de categorias personalizadas
- seletor opcional de categoria pai
- bloqueio visual de edicao e exclusao para categorias padrao
- atualizacao automatica da lista apos criar, editar ou excluir

O menu superior do layout autenticado agora possui links para `Dashboard`, `Contas` e `Categorias`.
## Tela de importacao

A rota `/imports` fica protegida pela mesma sessao do dashboard e oferece:

- selecao de conta ou cartao de credito antes do upload
- upload de arquivos CSV ou OFX com drag-and-drop ou clique
- preview das transacoes detectadas com edicao inline de data, descricao, valor, tipo e categoria
- sugestao automatica de categoria via regras ou heuristicas
- destaque visual de linhas invalidas
- remocao de linhas individuais antes da confirmacao
- confirmacao final com contagem de criadas e ignoradas (duplicadas)
- atualizacao automatica do dashboard e transacoes apos importar

## Tela de regras de categorizacao

A rota `/categorization-rules` fica protegida pela mesma sessao do dashboard e oferece:

- cards de resumo com total de regras, regras ativas e regras inativas
- busca por nome ou texto procurado
- listagem em grid com cards de regra (nome, comparacao, categoria, prioridade, status)
- criacao e edicao em modal com selecao de categorias reais do tenant
- testador de descricao para simular qual regra seria aplicada
- modal para aplicar regras em transacoes existentes com filtros de periodo e opcao "somente sem categoria"
- atualizacao automatica da lista apos criar, editar, excluir ou aplicar

## Telas disponiveis

- `/dashboard`
- `/accounts`
- `/credit-cards`
- `/budgets`
- `/goals`
- `/transactions`
- `/categories`
- `/categorization-rules`
- `/imports`

## Cartoes de credito

- pagina protegida em `/credit-cards`
- resumo com limite total, utilizado no mes, limite disponivel e quantidade de cartoes ativos
- cards premium com conta vinculada, bandeira, fechamento, vencimento, status e barra de uso do limite
- formulario em modal para criar e editar cartoes
- integracao com `creditCardService` para listar, detalhar, criar, atualizar e excluir
- a tela de transacoes passa a carregar cartoes reais e permite selecionar um cartao quando `paymentMethod = CREDIT_CARD`
