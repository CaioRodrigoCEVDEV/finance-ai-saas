# Finance AI SaaS — Documentação de Arquitetura

> **Última atualização:** 2026-06-13
> **Objetivo:** servir como mapa de referência para desenvolvedores que precisam entender, modificar ou estender o sistema.

---

## Visão Geral do Projeto

SaaS de finanças pessoais com suporte multi-tenant, planos FREE/PREMIUM, categorização inteligente, importação de extratos, faturamento recorrente e dashboard financeiro.

**Stack principal:**
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3 (PWA)
- **Backend:** Node.js + Express 4 + Prisma ORM
- **Banco:** PostgreSQL
- **Pagamentos:** Stripe + Mercado Pago

---

## Estrutura do Projeto

```
/
├── frontend/          # React SPA (Vite, Tailwind, PWA)
│   ├── src/
│   │   ├── components/  # componentes de domínio + UI kit
│   │   ├── contexts/    # AuthContext, ThemeContext, PrivacyContext, ToastContext
│   │   ├── layouts/     # AppLayout, MainLayout, admin/AdminLayout
│   │   ├── pages/       # uma página por rota (Dashboard, Accounts, Login...)
│   │   ├── routes/      # config centralizada de rotas + guards
│   │   ├── services/    # um service por domínio (chamadas HTTP)
│   │   └── utils/       # cn(), formatters(), greeting()
│   └── vite.config.js   # vite-plugin-pwa, react plugin
│
├── backend/           # API REST (Express, Prisma, Zod)
│   ├── src/
│   │   ├── config/       # env, cors, prisma client, planLimits
│   │   ├── middlewares/   # error-handler, authorize, audit-log, rate-limiter
│   │   ├── modules/      # +20 módulos (accounts, auth, billing, transactions...)
│   │   ├── routes/       # aggregator que monta todos os módulos
│   │   ├── utils/        # AppError, cookie-options, validate-request
│   │   └── validators/   # schemas Zod compartilhados
│   ├── prisma/
│   │   └── schema.prisma # 22 models, 28 enums
│   └── scripts/          # seed, create-user, migrate
│
├── graphify-out/      # knowledge graph gerado pelo Graphify
├── docs/              # documentação de deploy e CI/CD
└── scripts/           # deploy, PM2 ecosystem
```

---

## Organização de Módulos (Backend)

Cada domínio de negócio é um módulo autocontido em `backend/src/modules/<nome>/` com 4-5 arquivos:

| Arquivo | Responsabilidade |
|---------|-----------------|
| `*.routes.js` | Define endpoints HTTP e encadeia middleware (auth → validation → authorization → controller) |
| `*.controller.js` | Handlers finos que extraem dados do `request` e chamam o service |
| `*.service.js` | Lógica de negócio + queries Prisma |
| `*.validation.js` | Schemas Zod + `buildValidator()` para body/params/query |
| `*.middleware.js` | Middleware específico do módulo (ex: `authenticate` no auth) |

### Módulos existentes (24 registrados em `routes/index.js`)

`auth`, `accounts`, `admin`, `billing`, `budgets`, `categories`, `categorization-rules`, `credit-cards`, `dashboard`, `feedbacks`, `financial-calendar`, `goals`, `imports`, `invites`, `invoices`, `notifications`, `plans`, `profile`, `recurrences`, `reports`, `settings`, `tenants`, `transactions`, `users`

---

## Fluxo de Requisição Backend

```
[Request HTTP]
    ↓
app.js (middleware globais: helmet, compression, morgan, cors)
    ↓
webhookRoutes (montadas ANTES do json parser — raw body p/ Stripe)
    ↓
express.json() + cookieParser() + apiLimiter
    ↓
routes/index.js (roteador geral)
    ↓
module.routes.js
    ├── authenticate (lê cookie JWT → request.user + request.tenant)
    ├── validate* (Zod schema → body/params/query)
    ├── authorize* (role check: requireOwner, requireWrite, etc.)
    └── controller → service → Prisma → DB
    ↓
error-handler (AppError, PrismaError, ZodError, JWTError)
```

---

## Fluxo de Autenticação

### Registro
1. `POST /auth/register` → `authLimiter` → `validateRegister` (Zod)
2. `authService.register()`:
   - Verifica email duplicado
   - Hash bcrypt (12 rounds)
   - `$transaction`: cria `User` + cria `Tenant` (plan: `FREE`) + cria `UserTenant` (role: `OWNER`)
   - Assina JWT `{ userId, tenantId, role }`
3. Seta cookie `httpOnly`, retorna `{ user, tenant }`

### Login
1. `POST /auth/login` → `authLimiter` → `validateLogin` (Zod)
2. `authService.login()`:
   - Busca usuário por email (inclui `user_tenants.tenant`)
   - bcrypt.compare()
   - `pickCurrentTenant()` — prefere tenant com role OWNER
   - Assina JWT com `{ userId, tenantId, role }`
3. Seta cookie `httpOnly`, retorna `{ user, tenant }`

### Verificação (middleware `authenticate`)
1. Lê `request.cookies[nome_do_cookie]`
2. `verifyToken()` → `{ userId, tenantId, role }`
3. `findAuthenticatedUser(userId, tenantId)` — busca usuário com o tenant vinculado
4. Seta `request.user` e `request.tenant` na requisição

### Cookie JWT
- `httpOnly: true`, `sameSite: 'lax'` (dev) / `'none'` (prod), `secure` em produção
- JWT expira em 1 dia (configurável via `JWT_EXPIRES_IN`). Cookie `maxAge`: 7 dias em produção, sessão em dev.
- Nunca acessado via JavaScript (não está em localStorage)

---

## Fluxo Multi-Tenant / Workspace

### Isolamento por tenant
- Toda entidade de negócio tem `tenant_id` na tabela
- O middleware `authenticate` carrega `request.tenant = { id, name, role, plan }`
- **Toda query** nos services filtra por `tenant_id: request.tenant.id`
- Join `UserTenant` conecta usuários a tenants com papel (OWNER, ADMIN, MEMBER, READONLY)

### Controle de acesso por papel
- `requireOwner` — só OWNER
- `requireOwnerOrAdmin` — OWNER ou ADMIN
- `requireWrite` — OWNER, ADMIN ou MEMBER
- READONLY não tem permissão de escrita

### Super Admin
- Campo `User.globalRole` com valor `SUPER_ADMIN`
- Middleware `require-super-admin.js` — acesso ao painel `/admin/*`

---

## Planos FREE / PREMIUM

### Definição de limites (duas camadas)

**1. Em memória (`config/planLimits.js`)**
```js
FREE:    { maxAccounts: 1, maxCreditCards: 1, canImportFiles: false, canUseReports: false, ... }
PREMIUM: { todos os limites null/true (ilimitado) }
```

**2. Banco (`PlanLimit` model)**
- Gerenciável via admin em `PATCH /admin/plans/:plan`
- Campos: `max_accounts`, `max_credit_cards`, `max_users`, `max_transactions_per_month`, `can_import`, `can_export_reports`, `can_use_ai`, `can_use_open_finance`

### Onde os limites são verificados
- `plan.service.js` → `assertCanCreateAccount()`, `assertCanCreateCreditCard()` contam registros ativos do tenant e comparam com o limite do plano
- Chamado nos services de `accounts` e `credit-cards` antes de criar

### Mudança de plano
1. Usuário faz checkout → `billingService.createCheckout()` → subscription `PENDING`
2. Webhook do gateway (Stripe/MP) → `syncSubscriptionState()` → `updateTenantPlanBySubscription()`
3. Se subscription está PREMIUM e ACTIVE → `tenant.plan = 'PREMIUM'`
4. Se cancelou/expirou → `tenant.plan = 'FREE'`
5. Admin pode forçar via `PATCH /admin/tenants/:id`

---

## Padrão de Rotas (Backend)

### Convenção
- Rotas montadas em cada módulo com `express.Router()`
- Prefixo definido no arquivo de rotas do módulo
- Verbos REST: `GET (listar)`, `GET /:id (detalhe)`, `POST (criar)`, `PUT /:id (atualizar)`, `DELETE /:id (remover)`
- Ordem de middlewares: `authenticate` → `validate*` → `requireWrite` (opcional) → `controller`

### Exemplo (`accounts.routes.js`)
```js
router.get('/', authenticate, validateListQuery, controller.list)
router.get('/:id', authenticate, validateParams, controller.getById)
router.post('/', authenticate, requireWrite, validateCreate, controller.create)
router.put('/:id', authenticate, requireWrite, validateUpdate, controller.update)
router.delete('/:id', authenticate, requireWrite, validateParams, controller.delete)
```

### Exceções conhecidas
- `auth/register` e `auth/login` usam `authLimiter` em vez de `authenticate`
- Webhooks de billing não passam por `authenticate` nem por `express.json()` padrão
- Health check é público (`GET /health` sem auth)

---

## Padrão de Páginas / Componentes (Frontend)

### Estrutura de camadas
```
Page (em pages/)
├── useAuth() / usePrivacy() / useToast()
├── fetches dados via services/*
├── renderiza widgets de components/<domínio>/
└── usa componentes de components/ui/ (Button, Card, Input, Select...)
```

### Padrão de estados na página
Toda página implementa 3 estados visuais:
1. **loading** → `<LoadingSkeleton />` placeholders
2. **error** → card com mensagem + botão retry
3. **data** → conteúdo real

### UI Kit (`components/ui/`)
- `Button` — variantes (primary/secondary/danger/ghost), tamanhos, prop `as`
- `Card` — wrapper com `rounded-[28px]`, `shadow-soft`, padding responsivo
- `Input` — controlado, prop `label` e `error`
- `Select` — combo box completo (acessibilidade ARIA, navegação por teclado, portal)
- `Modal` / `FormModal` — `createPortal`, backdrop blur, Escape key
- `Badge` — 7 variantes de cor
- `LoadingSkeleton` — placeholder animado
- `EmptyState` — estado vazio com ilustração e texto
- `PageHeader` — cabeçalho padronizado com eyebrow, título e descrição

### Contextos globais
| Contexto | Estado | Hook |
|----------|--------|------|
| `AuthContext` | user, tenant, loading, initialized | `useAuth()` |
| `ThemeContext` | light/dark/system (persiste localStorage) | `useTheme()` |
| `PrivacyContext` | hideValues (mascara valores) | `usePrivacy()` |
| `ToastContext` | fila de notificações (auto-dismiss 4s) | `useToast()` |

### Padrão de guards de rota
- `ProtectedRoute` — redireciona para `/login` se não autenticado
- `GuestRoute` — redireciona para `/dashboard` se já autenticado
- `AdminRoute` — exige `isSuperAdmin === true`

### API calls
- `services/api.js` — singleton Axios com `withCredentials: true`, `VITE_API_URL` do env, interceptador 401
- Um service por domínio (ex: `transactionService.js` exporta `getTransactions`, `createTransaction`, etc.)

---

## Principais Entidades do Sistema

| Model | Descrição | Chave de tenant |
|-------|-----------|-----------------|
| `Tenant` | Workspace/organização | — (raiz) |
| `User` | Conta global do usuário | — |
| `UserTenant` | Vínculo N:N user↔tenant com role | tenant_id |
| `Account` | Conta financeira (corrente, poupança, etc.) | tenant_id |
| `CreditCard` | Cartão de crédito com limite/fechamento/vencimento | tenant_id |
| `CreditCardInvoice` | Fatura mensal do cartão | tenantId |
| `Transaction` | Transação financeira (soft-delete) | tenant_id |
| `Category` | Categoria hierárquica (globais + por tenant) | tenant_id (nullable) |
| `Budget` | Orçamento mensal por categoria | tenant_id |
| `Goal` | Meta financeira com progresso | tenant_id |
| `Recurrence` | Template de transação recorrente | tenantId |
| `CategorizationRule` | Regra de auto-categorização | tenant_id |
| `Subscription` | Assinatura do tenant (FREE/PREMIUM) | tenantId |
| `BillingPlan` | Plano de preço por ciclo | — |
| `PlanLimit` | Limites de funcionalidades por plano | — |
| `Notification` | Notificação in-app | tenant_id |
| `ReferralInvite` | Link de convite compartilhável | tenantId |
| `Feedback` | Feedback do usuário | tenant_id |
| `AuditLog` | Trilha de auditoria | tenant_id |
| `PaymentGatewayConfig` | Credenciais Stripe/MP (criptografadas) | — |

### Padrões comuns do schema
- **soft delete:** `deleted_at: DateTime?` em todas as entidades principais
- **tenant isolation:** `tenant_id: String` + `@@index([tenant_id])`
- **UUID:** `@default(uuid())` em todos os IDs
- **snake_case:** nomes das colunas com `@map()` para camelCase no Prisma

---

## Padrão Service / Controller / Validation (Backend)

### Service
```js
// async functions puras, sem acesso a req/res
async function listTransactions(tenantId, filters) {
  return prisma.transaction.findMany({
    where: { tenant_id: tenantId, deleted_at: null, ...buildListWhere(filters) },
    orderBy: { transaction_date: 'desc' },
    skip: filters.skip, take: filters.take,
  });
}
```

### Controller
```js
// thin handler — extrai dados do request, chama service, envia resposta
async function list(req, res, next) {
  try {
    const result = await transactionsService.listTransactions(req.tenant.id, req.query);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}
```

### Validation
```js
// schema Zod + factory buildValidator(target)
const createTransactionSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.string().transform(toDecimal),
  // ...
});
exports.validateCreate = buildValidator(createTransactionSchema, 'body');
```

---

## Boas Práticas para Futuras Alterações

### Backend
1. **Novo módulo = nova pasta** em `modules/<nome>/` com routes, controller, service, validation — nunca misture lógicas de domínios diferentes no mesmo arquivo
2. **Sempre filtre por `tenant_id`** em queries de entities tenant-scoped; o valor vem de `request.tenant.id` injetado pelo middleware
3. **Use `AppError`** para erros de negócio com `statusCode` e `code`; o error handler centralizado em `middlewares/error-handler.js` mapeia tudo
4. **Validação sempre com Zod** no módulo; use `buildValidator(schema, 'body'|'params'|'query')` da factory em `utils/validate-request.js`
5. **Middleware de autorização** explícito nas rotas: `requireOwner`, `requireOwnerOrAdmin`, `requireWrite`
6. **Webhooks** devem ser montados antes de `express.json()` em `app.js` para preservar raw body
7. **Plan limits:** adicione `assertCanCreateXxx()` em `plan.service.js` + verificação no service antes de criar
8. **Soft delete:** use `deleted_at: null` nos `where` e `deleted_at: new Date()` no update — nunca `delete()` do Prisma
9. **Transações:** use `prisma.$transaction()` para operações atômicas (ex: registro de usuário)
10. **Auditoria:** use o middleware `createAuditLog()` para ações administrativas sensíveis

### Frontend
1. **Nova página:** crie em `pages/` + adicione no `routes/index.jsx` com o guard apropriado (`ProtectedRoute`, `GuestRoute`, `AdminRoute`)
2. **Novo service:** crie em `services/<nome>Service.js` importando `api` de `services/api.js` — use Axios com `withCredentials`
3. **Novo contexto:** crie em `contexts/` seguindo o padrão `createContext + Provider + hook + export`
4. **Estado visual:** toda página deve tratar loading (skeleton), error (card + retry) e data (conteúdo)
5. **UI components:** componentes reutilizáveis vão em `components/ui/`; componentes de domínio vão em `components/<dominio>/`
6. **Estilos:** Tailwind exclusivamente, tema escuro via classe `dark:` no HTML, dark mode gerenciado pelo `ThemeContext`
7. **PWA:** o `vite-plugin-pwa` gera service worker automaticamente; o runtime caching para API usa `NetworkOnly`
8. **Mascara de valores:** use `usePrivacy()` e `formatCurrencyPrivacy()` para valores sensíveis

---

## Arquivos de Referência

### Backend
| Arquivo | Propósito |
|---------|-----------|
| `backend/src/app.js` | Bootstrap do Express, ordem de middlewares |
| `backend/src/routes/index.js` | Agregador de todos os módulos |
| `backend/prisma/schema.prisma` | Schema completo do banco (22 models) |
| `backend/src/config/env.js` | Validação Zod de variáveis de ambiente |
| `backend/src/config/planLimits.js` | Limites de planos FREE/PREMIUM/PRO/FAMILY |
| `backend/src/modules/auth/auth.middleware.js` | Middleware de autenticação JWT |
| `backend/src/modules/auth/auth.service.js` | Login, registro, findAuthenticatedUser |
| `backend/src/modules/billing/billing.service.js` | Checkout, webhooks, ciclo de subscription |
| `backend/src/modules/billing/billing.helpers.js` | `updateTenantPlanBySubscription` (muda plano) |
| `backend/src/modules/plans/plan.service.js` | `assertCanCreateAccount`, `assertCanCreateCreditCard` |
| `backend/src/middlewares/authorize.js` | `requireOwner`, `requireOwnerOrAdmin`, `requireWrite` |
| `backend/src/middlewares/error-handler.js` | Mapa de erros Prisma/AppError/Zod/JWT |
| `backend/src/middlewares/rate-limiter.js` | `authLimiter`, `apiLimiter`, `strictLimiter` |
| `backend/src/middlewares/audit-log.js` | `createAuditLog` factory |
| `backend/src/utils/app-error.js` | Classe AppError |
| `backend/src/utils/validate-request.js` | `buildValidator` factory para Zod |
| `backend/src/utils/cookie-options.js` | Config de cookie JWT httpOnly |
| `backend/src/modules/transactions/transactions.service.js` | Referência de service CRUD multi-tenant |
| `backend/src/modules/accounts/accounts.service.js` | Referência de integração com plan limits |

### Frontend
| Arquivo | Propósito |
|---------|-----------|
| `frontend/src/App.jsx` | Providers aninhados (Auth → Privacy → Toast → Routes) |
| `frontend/src/routes/index.jsx` | Config de rotas + guards (ProtectedRoute, GuestRoute, AdminRoute) |
| `frontend/src/contexts/AuthContext.jsx` | Autenticação: user, tenant, login, logout, ensureAuth |
| `frontend/src/contexts/ThemeContext.jsx` | Tema light/dark/system com persistência |
| `frontend/src/contexts/PrivacyContext.jsx` | Máscara de valores monetários |
| `frontend/src/contexts/ToastContext.jsx` | Notificações toast com portal |
| `frontend/src/services/api.js` | Axios singleton com cookie-based auth |
| `frontend/src/services/authService.js` | Exemplo de service (login, logout, getMe, register) |
| `frontend/src/services/transactionService.js` | Exemplo de CRUD service |
| `frontend/src/pages/Dashboard.jsx` | Página complexa: 8 endpoints, loading/error/data, widgets |
| `frontend/src/pages/Login.jsx` | Página simples: formulário controlado, useAuth |
| `frontend/src/components/ui/Button.jsx` | Padrão de UI component com variantes |
| `frontend/src/components/ui/Select.jsx` | Componente acessível com portal |
| `frontend/src/utils/cn.js` | Utilitário de classes condicionais |
| `frontend/src/utils/formatters.js` | Formatadores pt-BR (Intl) + labels |
| `frontend/vite.config.js` | PWA + React plugin config |
| `frontend/tailwind.config.js` | Cores brand, shadows custom, dark mode class |

### Infraestrutura
| Arquivo | Propósito |
|---------|-----------|
| `docker-compose.local.example.yml` | PostgreSQL + API locais |
| `ecosystem.config.js` | PM2 para produção |
| `.github/workflows/deploy-prod.yml` | CI/CD production |

### Graphify
| Arquivo | Propósito |
|---------|-----------|
| `graphify-out/GRAPH_REPORT.md` | Relatório completo do grafo de conhecimento |
| `graphify-out/graph.json` | Grafo JSON (1923 nós, 3930 arestas, 122 comunidades) |

---

*Documentação gerada com auxílio do Graphify (análise estrutural) e exploração manual do código-fonte.*
