# Finance AI SaaS

Sistema fullstack de gestao financeira pessoal multi-tenant com inteligencia de categorizacao, orcamentos, metas, importacao de extratos e relatorios.

## Visao geral

O Finance AI e um SaaS para controle financeiro pessoal e familiar. Ele permite cadastrar contas bancarias, cartoes de credito, categorias, transacoes, orcamentos mensais e metas financeiras. A arquitetura e multi-tenant, com isolamento de dados por tenant, autenticacao JWT via cookie httpOnly e dashboard premium com dados reais.

## Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Banco**: PostgreSQL
- **ORM**: Prisma
- **Validacao**: Zod
- **Estilizacao**: Tailwind CSS
- **Autenticacao**: JWT em cookie `httpOnly` (sameSite: lax, secure: false em dev)
- **Arquitetura**: Multi-tenant com isolamento por `tenant_id`

## Portas

- Backend: `3333`
- Frontend: `5173`

## Módulos implementados

- **Autenticacao**: login, logout, sessao via cookie, tenant ativo do usuario
- **Dashboard**: visao consolidada com saldo, receitas, despesas, economia, alertas inteligentes, top despesas, orcamentos, metas, fluxo mensal e distribuicao por categoria
- **Contas**: CRUD de contas bancarias, carteiras e investimentos com saldo inicial e atual
- **Cartoes de credito**: CRUD com limite, fatura, vencimento, fechamento e conta vinculada
- **Categorias**: CRUD com categorias globais padrao e personalizadas por tenant, com hierarquia (pai/filho)
- **Transacoes**: CRUD com filtros, paginacao, resumo mensal, vinculo a conta/cartao/categoria
- **Orcamentos**: CRUD mensal por categoria, com calculo automatico de uso baseado nas transacoes confirmadas
- **Metas**: CRUD com progresso automatico, prazo, contribuicao mensal sugerida e conclusao automatica
- **Importacao**: upload de CSV e OFX com preview, edicao inline, sugestao de categoria e confirmacao
- **Regras de categorizacao**: CRUD de regras automaticas por descricao, com testador e aplicacao em lote
- **Relatorios**: resumo financeiro, por categoria, por conta, por cartao, evolucao mensal, top despesas e exportacao CSV

## Banco de desenvolvimento

- O PostgreSQL de desenvolvimento pode rodar localmente ou remotamente.
- Configure a `DATABASE_URL` no `backend/.env`.
- O arquivo `docker-compose.local.example.yml` esta disponivel como referencia para subir um PostgreSQL local.

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

Edite o `backend/.env` com a `DATABASE_URL` e as variaveis de autenticacao:

```env
PORT=3333
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
JWT_COOKIE_NAME=financeai_token
FRONTEND_URL=http://localhost:5173
```

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

Edite o `frontend/.env`:

```env
VITE_API_URL=http://localhost:3333
```

## Como rodar o frontend

```bash
cd frontend
npm run dev
```

## Como rodar o seed de demo

O seed popula o banco com dados realistas para testes:

```bash
cd backend
npx prisma db seed
```

## Usuário demo

- **Email**: `admin@financeai.com`
- **Senha**: `123456`
- **Tenant**: `Finance AI Demo`

## O que o seed cria

- Tenant `Finance AI Demo` com plano `PREMIUM`
- Usuario `Admin Demo` vinculado como `OWNER`
- **4 contas**: Conta Corrente Nubank, Conta Inter, Carteira, Reserva CDB
- **3 cartoes**: Cartão Nubank, Cartão Inter, Cartão Mercado Pago
- **22 categorias globais**: Salario, Freelance, Rendimentos, Reembolso, Alimentacao, Mercado, Moradia, Transporte, Saude, Educacao, Lazer, Assinaturas, Cartao de credito, Impostos, Pets, Familia, Outros, Renda Fixa, Renda Variavel, Cripto, Reserva de Emergencia, Transferencia entre contas
- **10 regras de categorizacao**: IFOOD, UBER, 99, NETFLIX, SPOTIFY, MERCADO, SUPERMERCADO, FARMACIA, ACADEMIA, SALARIO
- **~90 transacoes**: distribuidas nos ultimos 6 meses com receitas, despesas e investimentos realistas
- **7 orcamentos**: para o mes atual com status seguro, alerta e excedido
- **5 metas**: Reserva de emergencia, Comprar notebook, Viagem de ferias, Quitar divida, Investir R$ 10.000

## Como testar a rota health

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

## Dashboard Premium

O dashboard em `/dashboard` e a visao central do sistema, com:

- Cards de resumo: saldo total, receitas, despesas, economia
- Widgets: cartoes de credito, orcamentos, metas
- Alertas inteligentes em tempo real
- Distribuicao de gastos por categoria
- Top 5 despesas do mes
- Transacoes recentes
- Fluxo mensal dos ultimos 6 meses

## Observacoes de arquitetura

- O schema do Prisma inclui `Tenant` e `User` com `tenantId` indexado.
- Todas as tabelas de dominio seguem o padrao de isolamento por tenant.
- A API usa cookies httpOnly e CORS com credenciais para o frontend.
- Soft delete com `deleted_at` em todas as entidades principais.
- Categorias globais usam `tenant_id = null` e `is_default = true`.
- A importacao CSV/OFX usa regras de categorizacao como primeira camada e heuristicas simples como fallback.

## Telas disponiveis

- `/` — landing page
- `/login` — autenticacao
- `/dashboard` — dashboard premium
- `/accounts` — contas financeiras
- `/credit-cards` — cartoes de credito
- `/categories` — categorias
- `/transactions` — transacoes
- `/budgets` — orcamentos
- `/goals` — metas
- `/imports` — importacao de extratos
- `/categorization-rules` — regras de categorizacao
- `/reports` — relatorios financeiros

## Scripts úteis

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Prisma
cd backend && npx prisma migrate dev
cd backend && npx prisma generate
cd backend && npx prisma studio
cd backend && npx prisma db seed
```

## Qualidade e UX

- Loading skeletons em todas as telas principais
- Estados vazios amigaveis com icones e acoes
- Erros amigaveis com retry
- Formatação consistente: moeda BRL, datas pt-BR, percentuais, enums amigaveis
- Interceptor 401 no frontend para redirecionar ao login automaticamente
- Responsividade mobile com sidebar colapsavel e tabelas em cards

## Licenca

MIT — projeto de referencia para SaaS financeiro.
