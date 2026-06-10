# Backend

API Node.js do Finance AI com Express, Prisma, Zod e estrutura inicial multi-tenant.

## Configuracao do ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Configure a conexao com o PostgreSQL remoto no arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
```

3. Mantenha a API na porta `3333`:

```env
PORT=3333
```

## Scripts

- `npm run dev`: inicia em desenvolvimento na porta `3333`
- `npm start`: inicia em produção
- `npm run prisma:generate`: gera o client do Prisma
- `npm run prisma:migrate`: cria/aplica migrations locais
- `npm run prisma:seed`: executa o seed de desenvolvimento

## Estrutura

- `src/config`: configurações de ambiente, CORS e banco
- `src/controllers`: controllers compartilhados
- `src/middlewares`: middlewares globais
- `src/routes`: rotas globais da aplicação
- `src/modules`: módulos de domínio
- `prisma/schema.prisma`: schema inicial do banco

## Prisma

Gerar migration inicial:

```bash
npx prisma migrate dev --name init_schema
```

Gerar o client do Prisma:

```bash
npx prisma generate
```

Abrir o Prisma Studio:

```bash
npx prisma studio
```

Rodar o seed de desenvolvimento:

```bash
npx prisma db seed
```

O seed cria e atualiza, de forma idempotente, os seguintes dados:

- tenant `Finance AI Demo`
- usuário admin `admin@financeai.com` com senha `123456`
- vínculo `UserTenant` com role `OWNER`
- categorias globais padrão com `tenant_id = null`
- contas demo `Conta Corrente Nubank` e `Carteira`
- cartão de crédito `Cartão Nubank`
- transações fictícias confirmadas no mês atual

Fluxo recomendado para preparar o ambiente:

```bash
npx prisma migrate dev --name init_schema
npx prisma generate
npx prisma db seed
```

## Observacoes sobre banco remoto

- Antes de rodar migrations, confirme se a `DATABASE_URL` aponta para o banco de desenvolvimento correto na VPS.
- Evite rodar `prisma migrate dev` contra bancos compartilhados ou ambientes que nao sejam de desenvolvimento.
- Garanta liberacao de rede, firewall e credenciais corretas entre sua maquina e a VPS.
- Em caso de latencia maior, comandos do Prisma podem levar mais tempo que em ambiente local.

## Health check

`GET http://localhost:3333/health`

## Endpoints do dashboard

- `GET http://localhost:3333/dashboard/summary`
- `GET http://localhost:3333/dashboard/expenses-by-category`
- `GET http://localhost:3333/dashboard/recent-transactions`
- `GET http://localhost:3333/dashboard/monthly-flow`

Todos os endpoints acima usam temporariamente o tenant demo localizado por `demo@financeai.com` ou `Finance AI Demo`.

### Exemplos com curl

```bash
curl http://localhost:3333/dashboard/summary
curl http://localhost:3333/dashboard/expenses-by-category
curl http://localhost:3333/dashboard/recent-transactions
curl http://localhost:3333/dashboard/monthly-flow
```

### Respostas esperadas

`GET /dashboard/summary`

```json
{
  "tenant": {
    "id": "...",
    "name": "Finance AI Demo",
    "plan": "PREMIUM"
  },
  "summary": {
    "totalBalance": 2800,
    "monthlyIncome": 6200,
    "monthlyExpense": 1297.5,
    "monthlyEconomy": 4902.5,
    "expensePercentage": 20.93
  }
}
```

`GET /dashboard/expenses-by-category`

```json
[
  {
    "categoryId": "...",
    "categoryName": "Mercado",
    "amount": 650,
    "percentage": 50.1
  }
]
```

`GET /dashboard/recent-transactions`

```json
[
  {
    "id": "...",
    "description": "Mercado",
    "amount": 650,
    "type": "EXPENSE",
    "status": "CONFIRMED",
    "categoryName": "Mercado",
    "accountName": "Conta Corrente Nubank",
    "creditCardName": null,
    "transactionDate": "2026-06-09T12:00:00.000Z"
  }
]
```

`GET /dashboard/monthly-flow`

```json
[
  {
    "month": "2026-01",
    "income": 5000,
    "expense": 3000,
    "economy": 2000
  }
]
```
