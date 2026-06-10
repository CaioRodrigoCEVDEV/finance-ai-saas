# Finance AI SaaS

Estrutura inicial fullstack do Finance AI com backend em Node.js + Express, frontend em React + Vite, PostgreSQL remoto em VPS e Prisma como ORM.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Banco: PostgreSQL
- ORM: Prisma
- Validacao: Zod
- Estilizacao: Tailwind CSS
- Autenticacao: preparado para JWT com cookie `httpOnly`
- Arquitetura: preparada para multi-tenant

## Portas

- Backend: `3333`
- Frontend: `5173`

## Banco de desenvolvimento

- O PostgreSQL de desenvolvimento nao sobe localmente neste projeto.
- O banco ja existe em uma VPS, rodando em um container Docker exclusivo.
- O backend deve se conectar ao banco exclusivamente pela variavel `DATABASE_URL` no arquivo `backend/.env`.
- O arquivo `docker-compose.local.example.yml` permanece apenas como referencia opcional para cenarios locais, fora do fluxo principal.

Formato esperado:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
```

## Como instalar o backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
```

Depois, edite o `backend/.env` com a `DATABASE_URL` do banco na VPS.

## Como rodar o backend

```bash
cd backend
npm run dev
```

## Como instalar o frontend

```bash
cd frontend
npm install
cp .env.example .env
```

## Como rodar o frontend

```bash
cd frontend
npm run dev
```

## Como testar a rota health

Com o backend rodando:

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "app": "Finance AI API"
}
```

## Dashboard Premium 2.0

O dashboard em `/dashboard` foi evoluido para uma visao completa da vida financeira do tenant autenticado, usando dados reais de contas, transacoes, cartoes, orcamentos e metas.

### Widgets do frontend

- `DashboardOverviewCards` — Saldo total, receitas, despesas e economia do mes.
- `CreditCardWidget` — Resumo de cartoes de credito (limite, fatura, uso).
- `BudgetStatusWidget` — Resumo de orcamentos (total, usado, alertas).
- `GoalsProgressWidget` — Resumo de metas (ativas, concluidas, progresso geral).
- `DashboardAlerts` — Alertas inteligentes baseados em regras reais (orcamento, cartao, meta, saldo, despesa vs receita).
- `ExpensesByCategory` — Distribuicao de gastos por categoria com barras visuais.
- `TopExpensesWidget` — Top 5 maiores despesas do mes.
- `RecentTransactions` — Ultimas transacoes registradas.
- `MonthlyFlow` — Fluxo mensal dos ultimos 6 meses.

### Endpoints novos do backend

- `GET /dashboard/overview` — visao consolidada (summary, accounts, creditCards, budgets, goals).
- `GET /dashboard/alerts` — alertas inteligentes em tempo real.
- `GET /dashboard/top-expenses` — top 5 despesas do mes.
- `GET /dashboard/budget-status` — lista de orcamentos com uso e status.
- `GET /dashboard/goals-progress` — metas ativas com progresso.

Os endpoints antigos (`/dashboard/summary`, `/dashboard/expenses-by-category`, `/dashboard/recent-transactions`, `/dashboard/monthly-flow`) continuam funcionando.

## Observacoes de arquitetura

- O schema inicial do Prisma ja inclui `Tenant` e `User` com `tenantId` indexado.
- As futuras tabelas de dominio podem seguir o mesmo padrao para isolamento por tenant.
- A base da API ja aceita cookies e CORS com credenciais para o frontend local.
- O Prisma usa `env("DATABASE_URL")` no `backend/prisma/schema.prisma`.
- O CRUD de contas financeiras ja esta disponivel em `GET/POST/PUT/DELETE /accounts` com soft delete e filtro por tenant autenticado.
- O CRUD de categorias ja esta disponivel em `GET/POST/PUT/DELETE /categories`, combinando categorias globais padrao e categorias personalizadas por tenant.
- O CRUD de metas financeiras ja esta disponivel em `GET/POST/PUT/PATCH/DELETE /goals` com soft delete, progresso automatico e calculo de contribuicao mensal sugerida.
- O CRUD de regras de categorizacao automatica ja esta disponivel em `GET/POST/PUT/DELETE /categorization-rules`, com teste de descricao (`POST /categorization-rules/test`) e aplicacao em transacoes existentes (`POST /categorization-rules/apply`).
- A importacao CSV/OFX usa o service de categorizacao real como primeira camada e heuristica simples como fallback.
