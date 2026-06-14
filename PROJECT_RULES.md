# PROJECT RULES — Finance AI SaaS

Este documento define regras obrigatórias para qualquer IA ou desenvolvedor que altere o projeto. Violar estas regras quebra comportamentos existentes, compromete segurança ou corrompe dados.

---

## 1. Regras Gerais do Projeto

- **Monorepo com frontend e backend separados.** Frontend em `frontend/`, backend em `backend/`. Cada um tem seu próprio `package.json`, dependências e scripts.
- **Nunca instale dependências no raiz.** Sempre rode `npm install` dentro de `frontend/` ou `backend/`.
- **ID único universal.** Toda entidade usa UUID v4 como chave primária. Nunca use IDs auto-increment.
- **Soft delete obrigatório.** Toda entidade de negócio tem `deleted_at (DateTime?)`. Nunca use `prisma.delete()` — sempre use `prisma.update()` com `{ deleted_at: new Date(), is_active: false }`.
- **Toda query de listagem/busca deve filtrar `deleted_at: null`.** Nenhuma exceção.
- **Decimal(18,2) para valores monetários.** Use `@db.Decimal(18, 2)` no Prisma. Nunca use `Float` ou `Int` para dinheiro.
- **Snake_case no banco, camelCase no código.** Mapeie com `@map()` e `@@map()` no Prisma.
- **Nunca use `any`.** Typescript implícito não existe (projeto usa JS), mas validação com Zod é obrigatória em toda entrada de API.
- **Variáveis de ambiente validadas com Zod.** O arquivo `backend/src/config/env.js` define o schema. Toda nova env var deve ser adicionada lá.
- **Portugûes (pt-BR) para strings de interface e mensagens de erro.** Inglês apenas para código, comentários e nomes de variáveis/funções.

---

## 2. Regras de UI/UX

- **Tailwind CSS 3 com `darkMode: 'class'`.** Nunca use `dark:` sem garantir que o elemento também tenha a classe base de cor clara.
- **Design system definido em `DESIGN.md`.** Cores, tipografia, sombras, espaçamentos devem seguir o design system. Nunca invente cores novas.
- **Landing page pública segue DESIGN.md seção 13.** O padrão visual da landing (header público, hero, glows animados, CTAs, planos, scroll) está documentado em `DESIGN.md#13-landing-page-pública`. Toda alteração na landing deve manter consistência com esse padrão.
- **Paleta brand (verde):** `brand-50` a `brand-900` definida no `tailwind.config.js`. Use `brand` para ações primárias, links e indicadores positivos.
- **Componentes base em `frontend/src/components/ui/`.** Use `Button`, `Card`, `Input`, `Select`, `Modal`, `Badge`, `LoadingSkeleton`, `EmptyState`, `PageHeader` em vez de criar HTML direto.
- **Formulários devem mostrar `error` prop nos inputs.** Todo Input e Select aceita `error` como string para exibir validação visual.
- **Toast de feedback para toda ação.** Use `useToast()` do `ToastContext` para sucesso/erro. Nunca deixe ação sem feedback.
- **Modal para confirmação de exclusão.** Toda ação destrutiva deve ter modal de confirmação.
- **Página offline PWA.** O app tem `public/offline.html` e estratégia network-only para API. Não remova nem altere o service worker sem testar offline.
- **LoadingSkeleton em toda lista/carregamento.** Nunca mostre tela vazia enquanto dados carregam.
- **Brasil (pt-BR) para formatação.** Use `formatCurrencyBR()`, `formatDateBR()`, `formatPaymentMethod()`, `formatTransactionType()` de `frontend/src/utils/formatters.js`.

---

## 3. Regras de Dark/Light Mode

- **Estratégia `class` no `<html>`.** O hook `useTheme()` do `ThemeContext` gerencia a classe `dark` no elemento `html`. Nunca manipule classes de tema manualmente.
- **Três modos:** `light`, `dark`, `system`. O modo `system` resolve via `prefers-color-scheme` e atualiza em tempo real.
- **Persistência em `localStorage`.** A chave é `finance-ai-theme`. Nunca mude o nome da chave.
- **Todo componente deve ter variante dark.** Se um componente não funciona em dark mode, está quebrado.
- **Cores de fundo:** página usa `bg-slate-50` (light) / `dark:bg-slate-950` (dark). Cards usam `bg-white` / `dark:bg-slate-800`.
- **Cores de texto:** primário `text-slate-900` / `dark:text-slate-100`. Secundário `text-slate-500` / `dark:text-slate-400`.
- **Inputs e selects:** fundo `bg-white` / `dark:bg-slate-700/40`.
- **Sombras:** `shadow-soft` e `shadow-glow` existem apenas no light mode. Em dark mode, remova sombras (o fundo escuro já dá contraste).
- **Modal overlay:** `bg-slate-950/40` em ambos os modos.

---

## 4. Regras de Multi-tenant/Workspace

- **Toda entidade de negócio tem `tenant_id`.** Nenhuma excessão. Account, CreditCard, Transaction, Category, Budget, Goal, Invoice, Recurrence — todas têm tenant_id como FK obrigatória.
- **Toda query de negócio filtra por `tenant_id`.** O tenant vem do JWT em `request.tenant.id` e deve ser passado a todo service como `tenantId`.
- **Nunca confie no `tenant_id` vindo do body/cliente.** O tenant vem exclusivamente do token JWT decodificado no middleware de autenticação.
- **User-Tenant é N:M via `UserTenant`.** Papéis: `OWNER`, `ADMIN`, `MEMBER`, `READONLY`. Único por par `(user_id, tenant_id)`.
- **`requireOwner` para ações de gestão do workspace** (excluir workspace, alterar plano, remover membros).
- **`requireOwnerOrAdmin` para ações administrativas** (convidar membros, alterar permissões).
- **`requireWrite` para ações de modificação de dados** (criar/editar contas, transações, cartões). READONLY não pode escrever.
- **Super admin global** usa `user.globalRole === 'SUPER_ADMIN'` e tem endpoints em `/admin`. Protegido por `requireSuperAdmin()`.
- **Registro cria User + Tenant + UserTenant(OWNER) em uma transaction.** Tudo ou nada.
- **Convites:** Código gerado com `crypto.randomBytes()` com expiração. Aceitar convite adiciona UserTenant com role MEMBER.

---

## 5. Regras dos Planos FREE e PREMIUM

- **Plano do tenant está em `Tenant.plan`.** Valores: `FREE | PRO | PREMIUM | FAMILY`.
- **Limites definidos em duas camadas:**
  - **`backend/src/config/planLimits.js`** (hardcoded, in-memory): `maxAccounts`, `maxCreditCards`, `canImportFiles`, `canUseReports`, `canUseAI`, `canUseOpenFinance`, `canUseCategorizationRules`.
  - **`PlanLimit` no banco** (seeded em `prisma/seed.js`): `max_accounts`, `max_credit_cards`, `max_users`, `max_transactions_per_month`, flags booleanas.
- **Limites FREE:**
  - `maxAccounts: 1`, `maxCreditCards: 1`, `maxUsers: 1`
  - `maxTransactionsPerMonth: 200`
  - `canImport: false`, `canExportReports: false`, `canUseAI: false`, `canUseOpenFinance: false`, `canUseCategorizationRules: false`
- **Planos pagos (PRO/PREMIUM/FAMILY):** sem limites de contas/cartões, todos os recursos liberados.
- **Verificação de limite na criação.** `planService.assertCanCreateAccount()` e `assertCanCreateCreditCard()` são chamados nos respectivos services antes de criar. **Nunca crie conta ou cartão sem chamar essas funções.**
- **Transações mensais:** O limite de `maxTransactionsPerMonth` conta transações criadas no mês corrente. Verificar antes de criar em planos FREE.
- **Upgrade/downgrade via webhook Stripe/Mercado Pago.** `billingService.syncSubscriptionState()` atualiza `tenant.plan`. Se cancelar/expirar, volta para `FREE`.
- **Se o plano é FREE e o usuário tenta recurso bloqueado**, retorne `AppError('RECURSO_BLOQUEADO', 403)` com mensagem explicativa.

---

## 6. Regras de Contas, Cartões, Transações, Faturas e Limites

### Contas
- **Saldo é computado, nunca armazenado.** `currentBalance = initialBalance + SUM(INCOME CONFIRMED) - SUM(EXPENSE CONFIRMED)`.
- **Tipo de conta:** `CHECKING | SAVINGS | CASH | INVESTMENT | WALLET | OTHER`.
- **Deleção:** soft delete + `is_active: false`. Verificar saldo zero antes de permitir exclusão? Não obrigatório, mas avisar ao usuário.

### Cartões de Crédito
- **Limite disponível:** `max(limitAmount - usedAmount, 0)`.
- **`usedAmount`:** soma de despesas PENDING + CONFIRMED (excluindo períodos de fatura já pagos).
- **Não pode deletar cartão com transações vinculadas.** Verificar `count > 0` e bloquear.
- **Cartão tem `account_id` opcional** (conta para pagamento da fatura).
- **`closing_day` e `due_day`** controlam o ciclo da fatura.

### Transações
- **Cartão de crédito:** `account_id` DEVE ser `null`, `credit_card_id` DEVE ser preenchido.
- **Não-cartão:** `account_id` DEVE ser preenchido, `credit_card_id` DEVE ser `null`.
- **Transferência:** `category_id` DEVE ser `null`. Tipo DEVE ser `TRANSFER`.
- **Categoria:** O tipo da categoria DEVE ser compatível com o tipo da transação (INCOME/EXPENSE/TRANSFER/INVESTMENT).
- **Valor:** DEVE ser positivo. Use `z.number().positive()`.
- **Parcelamento:** Se `isInstallment === true`, `installmentNumber` e `installmentTotal` são obrigatórios. `installmentNumber` DEVE estar entre 1 e `installmentTotal`. Se `isInstallment === false`, os campos de parcela DEVEM ser rejeitados.
- **Status padrão para nova transação:** `CONFIRMED`. Somente importações podem criar como `PENDING`.

### Faturas
- **Ciclo de vida:** `OPEN` → (após fechamento) → `CLOSED` → (após vencimento) → `OVERDUE` → (após pagamento) → `PAID`.
- **Fatura PAID não pode ser recalculada.**
- **Fatura PAID não pode ser paga novamente.**
- **Pagamento de fatura:** Cria transação do tipo EXPENSE com `source: CREDIT_CARD_PAYMENT`, vinculada à conta de pagamento do cartão.
- **Cancelamento de pagamento:** Soft delete na transação de pagamento, volta status da fatura para CLOSED/OVERDUE.
- **Suporta apenas pagamento integral.** Pagamento parcial não implementado.

### Orçamentos (Budgets)
- **Único por `(tenant_id, category_id, month, year)`.**
- **Status por uso:**
  - `SAFE`: < 70%
  - `WARNING`: 70–100%
  - `EXCEEDED`: ≥ 100%

---

## 7. Regras de Recorrências e Calendário

- **Recorrência é um template**, não uma transação. A geração de fato cria a transação.
- **Frequências válidas:** `DAILY | WEEKLY | BIWEEKLY | MONTHLY | BIMONTHLY | QUARTERLY | SEMIANNUAL | YEARLY`.
- **Geração de transação:** Só gera se status for `ACTIVE` e `nextRunDate <= endDate`.
- **Dedup:** Toda transação gerada tem `(recurrence_id, recurrence_occurrence_date)` único. Verifique duplicata antes de criar.
- **Após gerar:** atualiza `lastRunDate` e calcula `nextRunDate` via `calculateNextRunDate()`. Se `nextRunDate > endDate`, marca como `FINISHED`.
- **Calendário financeiro:** Combina transações reais + previews de recorrência. Dedup: se já existe transação para `(recurrence_id, date)`, não mostra preview.
- **Segurança dia-fim-de-mês:** `calculateNextRunDate` deve tratar meses com menos dias (ex.: 31/jan → 28/fev).

---

## 8. Regras de Validação Frontend/Backend

- **Zod é o único validador no backend.** Nunca use Joi, Yup ou validação manual inline.
- **Todo body, param e query de rota DEVE ser validado.** Use `validateRequest(schema)`, `validateParams(schema)`, `validateQuery(schema)` do `utils/validate-request.js`.
- **Padrão de validação:** Defina schema Zod → crie validator com `buildValidator()` → aplique na rota.
- **SuperRefine para regras cross-campo.** Ex.: se `isInstallment`, então `installmentNumber` e `installmentTotal` são obrigatórios.
- **Frontend não faz validação própria.** Envia dados para API e exibe erros retornados. O backend é a autoridade.
- **Campos opcionais:** Use `normalizeOptionalNumber`, `normalizeOptionalText`, `normalizeOptionalDate` para campos que podem vir como `undefined`, `null` ou string vazia.
- **Erros de validação:** Converta ZodError em `AppError(400)` com a mensagem do primeiro issue. Nunca exponha detalhes internos.

---

## 9. Regras de Segurança

- **JWT em cookie httpOnly.** O token NUNCA é acessível via JavaScript. Sempre `httpOnly: true, sameSite: 'lax'` (dev) ou `'none'` (prod), `secure: true` em produção.
- **Nome do cookie:** `finance_ai_token` (configurável via `JWT_COOKIE_NAME` em env). Nunca mude sem atualizar todos os consumers.
- **JWT expira em 1 dia (configurável).** Payload: `{ userId, tenantId, role }`. Nunca inclua senha ou dados sensíveis.
- **Bcrypt 12 rounds para senhas.** Nunca reduza o número de rounds.
- **Rate limiting obrigatório:**
  - `authLimiter`: 10 req/15min para login/register.
  - `apiLimiter`: 200 req/15min para API geral.
  - `strictLimiter`: 30 req/15min para operações sensíveis.
- **Helmet configurado com CSP.** Nunca desabilite Helmet. Se precisar de recurso bloqueado pelo CSP, ajuste a política explicitamente.
- **CORS com whitelist explícita.** `cors.js` define origens permitidas. Nunca use `origin: '*'`.
- **Cache-Control: no-store** em todas as respostas da API. Nunca permita cache de dados financeiros.
- **Super admin:** Endpoints `/admin/*` protegidos por `requireSuperAdmin()` que checa `user.globalRole === 'SUPER_ADMIN'`.
- **Audit log para ações sensíveis:** Exclusões, mudanças de plano, alterações de permissão devem ser logadas via `createAuditLog()`.
- **Nunca armazene secrets no código.** Tudo em variáveis de ambiente validadas por `env.js`.
- **Nunca log dados sensíveis.** Senhas, tokens, cookies completos não devem aparecer em logs.

---

## 10. Coisas que Nunca Devem Ser Feitas

- **Nunca remova `tenant_id` de uma query.** Toda consulta deve ser isolada por tenant.
- **Nunca use `prisma.delete()`.** Sempre soft delete com `deleted_at`.
- **Nunca confie no cliente para definir `tenant_id`.** O tenant vem do JWT.
- **Nunca armazene saldo em conta corrente.** Saldo é computado de transações.
- **Nunca crie conta ou cartão sem verificar `planService.assertCanCreate*()`.
- **Nunca permita `account_id` em transação de crédito ou `credit_card_id` em transação normal.**
- **Nunca altere a estratégia de tema (dark mode via `class` no `<html>`) sem refatorar todo o CSS.**
- **Nunca exponha erros internos em produção.**
- **Nunca faça `prisma.$transaction` sem tratar rollback.**
- **Nunca ignore o `deleted_at` em queries de listagem.**
- **Nunca altere o formato de currency/date sem atualizar `formatters.js` e todos os consumers.**
- **Nunca quebre a dedup de recorrência (`(recurrence_id, recurrence_occurrence_date)`).**
- **Nunca permita deletar cartão com transações vinculadas.**
- **Nunca recalcule uma fatura já paga (`PAID`).**
- **Nunca pule o rate limiting em rotas de auth.**

---

## 11. Checklist Antes de Finalizar Qualquer Alteração

- [ ] **Isolamento de tenant:** Toda query tem `where: { tenant_id, deleted_at: null }`?
- [ ] **Soft delete:** Nenhum `prisma.delete()` foi introduzido?
- [ ] **Validação Zod:** Toda nova rota tem validação de body/params/query?
- [ ] **Rate limit:** Rotas novas de auth têm `authLimiter`? Rotas sensíveis têm `strictLimiter`?
- [ ] **Plano FREE:** Se criou recurso limitado, verificou `planLimits`?
- [ ] **Dark mode:** O novo componente funciona com `dark:` classes?
- [ ] **Toast de feedback:** Toda ação do usuário tem feedback visual (sucesso/erro)?
- [ ] **Formatação pt-BR:** Usou `formatCurrencyBR`/`formatDateBR` em vez de `toLocaleString` manual?
- [ ] **CORS/CSP:** Se adicionou nova origem ou recurso externo, atualizou CORS e CSP?
- [ ] **Sem `any`/sem `console.log`:** Removeu debug logs e tipos inseguros?
- [ ] **Testou offline:** A página funciona com service worker? (se aplicável)
- [ ] **Design system:** Usou cores da paleta brand e componentes ui/? Não inventou cor nova?

---

## Arquivos Usados como Referência

- `frontend/package.json`
- `frontend/tailwind.config.js`
- `frontend/src/App.jsx`
- `frontend/src/contexts/ThemeContext.jsx`
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/contexts/PrivacyContext.jsx`
- `frontend/src/utils/formatters.js`
- `backend/package.json`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/src/app.js`
- `backend/src/config/env.js`
- `backend/src/config/cors.js`
- `backend/src/config/planLimits.js`
- `backend/src/middlewares/authorize.js`
- `backend/src/middlewares/rate-limiter.js`
- `backend/src/middlewares/error-handler.js`
- `backend/src/middlewares/audit-log.js`
- `backend/src/modules/auth/auth.middleware.js`
- `backend/src/modules/auth/auth.service.js`
- `backend/src/modules/accounts/accounts.service.js`
- `backend/src/modules/transactions/transactions.service.js`
- `backend/src/modules/transactions/transactions.validation.js`
- `backend/src/modules/credit-cards/credit-cards.service.js`
- `backend/src/modules/credit-cards/credit-cards.validation.js`
- `backend/src/modules/invoices/invoices.helper.js`
- `backend/src/modules/invoices/invoices.service.js`
- `backend/src/modules/recurrences/recurrences.service.js`
- `backend/src/modules/financial-calendar/financialCalendar.service.js`
- `backend/src/modules/plans/plan.service.js`
- `backend/src/modules/billing/billing.helpers.js`
- `backend/src/modules/dashboard/dashboard.service.js`
- `backend/src/modules/categories/categories.service.js`
- `backend/src/modules/budgets/budgets.service.js`
- `backend/src/modules/goals/goals.service.js`
- `backend/src/modules/invites/invites.validation.js`
- `backend/src/modules/invites/invites.service.js`
- `backend/src/modules/imports/imports.service.js`
- `backend/src/utils/app-error.js`
- `backend/src/utils/validate-request.js`
- `backend/src/utils/cookie-options.js`
- `backend/src/utils/credit-card-limit.js`
- `ARCHITECTURE.md`
- `DESIGN.md`
- `graphify-out/GRAPH_REPORT.md`
