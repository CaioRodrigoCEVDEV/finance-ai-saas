# Backend

API Node.js do Finance AI com Express, Prisma, Zod, JWT em cookie httpOnly e estrutura multi-tenant.

## Configuracao do ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Configure a conexao com o PostgreSQL remoto no arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
```

3. Configure as variaveis de autenticacao e frontend:

```env
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
COOKIE_NAME=finance_ai_token
FRONTEND_URL=http://localhost:5173
```

4. Mantenha a API na porta `3333`:

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

Esse endpoint continua publico.

## Autenticacao

Autenticacao baseada em JWT gravado em cookie `httpOnly`.

- `httpOnly: true`
- `sameSite: lax`
- `secure: false` em desenvolvimento
- frontend deve enviar `credentials`

### Endpoints de auth

- `POST http://localhost:3333/auth/login`
- `POST http://localhost:3333/auth/logout`
- `GET http://localhost:3333/auth/me`

`POST /auth/login`

```json
{
  "email": "admin@financeai.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "user": {
    "id": "...",
    "name": "Admin Demo",
    "email": "admin@financeai.com"
  },
  "tenant": {
    "id": "...",
    "name": "Finance AI Demo",
    "role": "OWNER",
    "plan": "PREMIUM"
  }
}
```

`GET /auth/me`

Retorna o usuario autenticado e o tenant atual a partir do cookie.

`POST /auth/logout`

Limpa o cookie e retorna:

```json
{
  "message": "Logout realizado com sucesso"
}
```

## Endpoints do dashboard

- `GET http://localhost:3333/dashboard/summary`
- `GET http://localhost:3333/dashboard/expenses-by-category`
- `GET http://localhost:3333/dashboard/recent-transactions`
- `GET http://localhost:3333/dashboard/monthly-flow`

Todos os endpoints acima exigem autenticacao e usam o `tenant_id` do usuario autenticado.

### Exemplos com curl

```bash
curl -i -c cookies.txt -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@financeai.com","password":"123456"}'

curl -b cookies.txt http://localhost:3333/auth/me
curl -b cookies.txt http://localhost:3333/dashboard/summary
curl -b cookies.txt http://localhost:3333/dashboard/expenses-by-category
curl -b cookies.txt http://localhost:3333/dashboard/recent-transactions
curl -b cookies.txt http://localhost:3333/dashboard/monthly-flow
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

## Endpoints de accounts

- `GET http://localhost:3333/accounts`
- `GET http://localhost:3333/accounts/:id`
- `POST http://localhost:3333/accounts`
- `PUT http://localhost:3333/accounts/:id`
- `DELETE http://localhost:3333/accounts/:id`

Todos os endpoints acima exigem autenticacao, usam `req.tenant.id` para isolamento multi-tenant e aplicam soft delete com `deleted_at`.

### Regras aplicadas

- `GET /accounts` retorna apenas contas ativas do tenant atual com `deleted_at = null`
- `GET /accounts/:id` retorna apenas contas do tenant atual
- `POST /accounts` grava `tenant_id` a partir da sessao autenticada e `user_id` com `req.user.id`
- `PUT /accounts/:id` so atualiza contas do tenant atual
- `DELETE /accounts/:id` nao remove fisicamente o registro; apenas preenche `deleted_at` e desativa a conta

### Exemplo de payload para criar conta

```json
{
  "name": "Conta Inter",
  "type": "CHECKING",
  "bankName": "Inter",
  "initialBalance": 1000,
  "currentBalance": 1000,
  "currency": "BRL",
  "color": "#f97316",
  "icon": "bank"
}
```

### Exemplos com curl

```bash
curl -i -c cookies.txt -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@financeai.com","password":"123456"}'

curl -b cookies.txt http://localhost:3333/accounts

curl -b cookies.txt -X POST http://localhost:3333/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"Conta Inter","type":"CHECKING","bankName":"Inter","initialBalance":1000,"currentBalance":1000,"currency":"BRL","color":"#f97316","icon":"bank"}'

curl -b cookies.txt http://localhost:3333/accounts/SEU_ACCOUNT_ID

curl -b cookies.txt -X PUT http://localhost:3333/accounts/SEU_ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Conta Inter Premium","currentBalance":1450.75,"isActive":true}'

curl -b cookies.txt -X DELETE http://localhost:3333/accounts/SEU_ACCOUNT_ID
```

## Endpoints de categories

- `GET http://localhost:3333/categories`
- `GET http://localhost:3333/categories/:id`
- `POST http://localhost:3333/categories`
- `PUT http://localhost:3333/categories/:id`
- `DELETE http://localhost:3333/categories/:id`
- `GET http://localhost:3333/transactions`
- `GET http://localhost:3333/transactions/:id`
- `POST http://localhost:3333/transactions`
- `PUT http://localhost:3333/transactions/:id`
- `DELETE http://localhost:3333/transactions/:id`
- `GET http://localhost:3333/transactions/summary/month`

Todos os endpoints acima exigem autenticacao e seguem as regras abaixo:

- categorias globais padrao usam `tenant_id = null` e `is_default = true`
- categorias personalizadas usam `tenant_id = req.tenant.id` e `is_default = false`
- listagens retornam categorias globais padrao e categorias do tenant autenticado
- soft delete com `deleted_at`
- categorias globais padrao nao podem ser editadas ou excluidas
- categorias de outro tenant nao ficam acessiveis

### Query params de listagem

- `type=INCOME|EXPENSE|TRANSFER|INVESTMENT`
- `includeInactive=true|false`

### Exemplos com curl

```bash
curl -b cookies.txt http://localhost:3333/categories
curl -b cookies.txt "http://localhost:3333/categories?type=EXPENSE"
curl -b cookies.txt "http://localhost:3333/categories?includeInactive=true"

curl -b cookies.txt -X POST http://localhost:3333/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Delivery","type":"EXPENSE","parentId":null,"color":"#ef4444","icon":"shopping-bag"}'

curl -b cookies.txt http://localhost:3333/categories/SEU_CATEGORY_ID

curl -b cookies.txt -X PUT http://localhost:3333/categories/SEU_CATEGORY_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Delivery premium","type":"EXPENSE","parentId":null,"color":"#f97316","icon":"bag","isActive":true}'

curl -b cookies.txt -X DELETE http://localhost:3333/categories/SEU_CATEGORY_ID
```

Se houver transacoes vinculadas, a API retorna:

```json
{
  "message": "Categoria possui transacoes vinculadas e nao pode ser excluida."
}
```

## Endpoints de credit-cards

- `GET http://localhost:3333/credit-cards`
- `GET http://localhost:3333/credit-cards/:id`
- `POST http://localhost:3333/credit-cards`
- `PUT http://localhost:3333/credit-cards/:id`
- `DELETE http://localhost:3333/credit-cards/:id`

Todos os endpoints acima exigem autenticacao, usam `req.tenant.id` para isolamento multi-tenant e aplicam soft delete com `deleted_at`.

### Regras aplicadas

- `GET /credit-cards` retorna apenas cartoes ativos do tenant atual com `deleted_at = null`
- `GET /credit-cards/:id` retorna cartao do tenant atual com conta vinculada e resumo do mes atual
- `POST /credit-cards` grava `tenant_id` a partir da sessao autenticada e `user_id` com `req.user.id`
- `POST` e `PUT` validam `accountId` somente dentro do tenant autenticado
- `currentInvoiceAmount` considera apenas transacoes `CONFIRMED` do mes atual com `type = EXPENSE`
- `availableLimit` nao retorna valor negativo
- `DELETE /credit-cards/:id` nao remove fisicamente o registro; apenas preenche `deleted_at` e desativa o cartao
- cartoes com transacoes vinculadas nao podem ser excluidos

### Exemplo de payload para criar cartao

```json
{
  "name": "Cartao Inter",
  "brand": "MASTERCARD",
  "limitAmount": 3000,
  "closingDay": 8,
  "dueDay": 15,
  "accountId": "UUID_DA_CONTA",
  "color": "#f97316",
  "isActive": true
}
```

### Exemplos com curl

```bash
curl -b cookies.txt http://localhost:3333/credit-cards

curl -b cookies.txt -X POST http://localhost:3333/credit-cards \
  -H "Content-Type: application/json" \
  -d '{"name":"Cartao Inter","brand":"MASTERCARD","limitAmount":3000,"closingDay":8,"dueDay":15,"accountId":"ID_DA_CONTA","color":"#f97316","isActive":true}'

curl -b cookies.txt http://localhost:3333/credit-cards/SEU_CARTAO_ID

curl -b cookies.txt -X PUT http://localhost:3333/credit-cards/SEU_CARTAO_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Cartao Inter Black","limitAmount":4500,"closingDay":10,"dueDay":17,"isActive":true}'

curl -b cookies.txt -X DELETE http://localhost:3333/credit-cards/SEU_CARTAO_ID
```

Se houver transacoes vinculadas, a API retorna:

```json
{
  "message": "Cartao possui transacoes vinculadas e nao pode ser excluido."
}
```

## Endpoints de transactions

- `GET http://localhost:3333/transactions`
- `GET http://localhost:3333/transactions/:id`
- `POST http://localhost:3333/transactions`
- `PUT http://localhost:3333/transactions/:id`
- `DELETE http://localhost:3333/transactions/:id`
- `GET http://localhost:3333/transactions/summary/month`

Todos os endpoints acima exigem autenticacao, usam `req.tenant.id` para isolamento multi-tenant e ignoram registros com `deleted_at` preenchido.

### Filtros de listagem

- `page`
- `limit`
- `type=INCOME|EXPENSE|TRANSFER|INVESTMENT`
- `status=PENDING|CONFIRMED|CANCELED`
- `accountId`
- `creditCardId`
- `categoryId`
- `startDate`
- `endDate`
- `search`
- `source=MANUAL|CSV|OFX|OPEN_FINANCE|API`

### Regras aplicadas

- `tenant_id` vem sempre da sessao autenticada
- `user_id` na criacao vem de `req.user.id`
- `source` na criacao sempre sera `MANUAL`
- conta, cartao e categoria precisam pertencer ao tenant atual ou ser categoria global padrao
- categoria precisa combinar com o tipo da transacao quando informada
- pagamentos fora de `CREDIT_CARD` exigem `accountId`
- pagamentos em `CREDIT_CARD` exigem `creditCardId` ou `accountId`
- exclusao usa soft delete com `deleted_at`
- resumo mensal considera apenas transacoes `CONFIRMED`

### Exemplo de payload para criar transacao

```json
{
  "description": "Mercado",
  "amount": 650,
  "type": "EXPENSE",
  "status": "CONFIRMED",
  "transactionDate": "2026-06-10",
  "paymentMethod": "DEBIT_CARD",
  "accountId": "UUID_DA_CONTA",
  "creditCardId": null,
  "categoryId": "UUID_DA_CATEGORIA",
  "notes": "Compra mensal",
  "isRecurring": false,
  "isInstallment": false,
  "installmentNumber": null,
  "installmentTotal": null
}
```

### Exemplos com curl

```bash
curl -i -c cookies.txt -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@financeai.com","password":"123456"}'

curl -b cookies.txt http://localhost:3333/transactions

curl -b cookies.txt http://localhost:3333/transactions/summary/month

curl -b cookies.txt -X POST http://localhost:3333/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Teste despesa manual","amount":25.9,"type":"EXPENSE","status":"CONFIRMED","transactionDate":"2026-06-10","paymentMethod":"PIX","accountId":"ID_DA_CONTA","categoryId":"ID_DA_CATEGORIA"}'

curl -b cookies.txt -X PUT http://localhost:3333/transactions/ID_DA_TRANSACAO \
  -H "Content-Type: application/json" \
  -d '{"description":"Teste despesa manual editada","amount":30.5,"type":"EXPENSE","status":"CONFIRMED","transactionDate":"2026-06-10","paymentMethod":"PIX","accountId":"ID_DA_CONTA","categoryId":"ID_DA_CATEGORIA"}'

curl -b cookies.txt -X DELETE http://localhost:3333/transactions/ID_DA_TRANSACAO
```
