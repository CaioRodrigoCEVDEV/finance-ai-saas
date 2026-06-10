# Accounts Module

Modulo de contas financeiras do Finance AI.

Arquivos principais:

- `accounts.routes.js`
- `accounts.controller.js`
- `accounts.service.js`
- `accounts.validation.js`

Responsabilidades:

- CRUD de contas do tenant autenticado
- validacao com Zod
- persistencia com Prisma Client
- isolamento multi-tenant com filtro por `tenant_id`
- soft delete usando `deleted_at`
