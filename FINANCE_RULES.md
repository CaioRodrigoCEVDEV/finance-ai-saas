# Regras Financeiras — Finance AI SaaS

Este documento descreve todas as regras financeiras sensíveis implementadas no sistema.
Qualquer alteração nestas regras pode corromper saldos, limites, faturas ou relatórios.

---

## 1. Diferença entre Conta e Cartão de Crédito

### Conta (Account)
- Representa **dinheiro disponível**: conta corrente, poupança, dinheiro físico, carteira digital, investimento.
- Tipos: `CHECKING | SAVINGS | CASH | INVESTMENT | WALLET | OTHER`.
- Tem `initial_balance` e saldo **computado** a partir de transações CONFIRMED.
- O saldo nunca é armazenado — é calculado sob demanda via `computeAccountBalances()`.
- Fórmula do saldo: `initial_balance + SUM(INCOME CONFIRMED) - SUM(EXPENSE CONFIRMED)`.

### Cartão de Crédito (CreditCard)
- Representa **crédito rotativo**: um limite emprestado pelo banco, pago depois via fatura.
- Tem `limit_amount`, `closing_day`, `due_day`.
- **Não armazena dinheiro** — tem limite disponível calculado: `max(limitAmount - usedAmount, 0)`.
- Opcionalmente vinculado a uma conta (`account_id`) para pagamento da fatura.
- `usedAmount` considera despesas PENDING + CONFIRMED, excluindo períodos de faturas já pagas.

### Regra fundamental
- Transação com `paymentMethod === 'CREDIT_CARD'` **nunca** tem `account_id` preenchido — apenas `credit_card_id`.
- Transação **sem** cartão de crédito **nunca** tem `credit_card_id` preenchido — apenas `account_id`.
- Uma receita **nunca** pode ser associada a cartão de crédito.

---

## 2. Quando uma Transação Afeta Saldo de Conta

### Somente CONFIRMED impacta saldo
```sql
-- accounts.service.js / computeAccountBalances()
WHERE status = 'CONFIRMED'
```

- **CONFIRMED**: altera o saldo da conta (soma receitas, subtrai despesas).
- **PENDING**: **não** altera saldo. Transações pendentes são ignoradas no cálculo de saldo.
- **CANCELED**: **não** altera saldo. Ignoradas em todas as agregações.

### Transferências
- TRANSFER é um tipo de transação que NÃO tem `category_id`.
- O saldo é afetado como EXPENSE na conta de origem e INCOME na conta de destino (duas transações).

### Pagamento de fatura
- Ao pagar fatura, o sistema cria uma transação EXPENSE com `source: 'CREDIT_CARD_PAYMENT'` na conta de pagamento.
- Essa transação **reduz o saldo da conta** normalmente (status CONFIRMED).

---

## 3. Quando uma Transação Afeta Limite de Cartão

### PENDING e CONFIRMED impactam o limite
```js
// credit-card-limit.js
const LIMIT_IMPACTING_STATUSES = ['CONFIRMED', 'PENDING'];
```

- `usedAmount` = soma de todas as despesas **PENDING + CONFIRMED** vinculadas ao cartão.
- `availableLimit = max(limitAmount - usedAmount, 0)`.
- **CANCELED não impacta** limite.

### Exclusão de faturas pagas
- Quando `excludePaidInvoices = true` (usado no cálculo de `usedAmount`):
  - Transações cuja `transaction_date` cai dentro do período de uma fatura PAID são **excluídas** do cálculo.
  - Isso evita dupla contagem: a despesa já foi paga via fatura, então não deve mais "consumir" limite.
- `currentInvoiceAmount` (usado para exibição) **inclui** transações de faturas pagas.

### Limite mínimo
- O limite disponível nunca fica negativo: `Math.max(limitAmount - usedAmount, 0)`.

---

## 4. Como Despesas Confirmadas Impactam Valores

### Saldo de conta
- `currentBalance = initial_balance + income_total - expense_total` (só CONFIRMED).

### Orçamentos (Budgets)
- `budgets.service.js / getUsedAmountsByCategory()`: consulta transações `type: 'EXPENSE'` e `status: 'CONFIRMED'` do mês.
- Orçamento usa apenas **CONFIRMED** para calcular `usedAmount`.
- Status do orçamento:
  - `SAFE`: uso ≤ 70%
  - `WARNING`: uso 70–100%
  - `EXCEEDED`: uso ≥ 100%

### Resumo mensal
- `getMonthSummary()` agrega transações `status: 'CONFIRMED'` e tipos `INCOME | EXPENSE | INVESTMENT`.
- `balance = income - expense - investment`.

### Fatura de cartão
- `calculateInvoiceTotal()`: soma **todas** as transações EXPENSE do período (sem filtrar por status).
- **Todas as despesas** no período da fatura entram no cálculo, independente do status.

---

## 5. Como Receitas Impactam Valores

### Saldo de conta
- Aumentam o saldo: `currentBalance` soma todas as receitas CONFIRMED.

### Podem ser recorrentes
- Recorrências do tipo `INCOME` geram transações de receita normalmente.
- **Não podem ser associadas a cartão de crédito**: validação `recurrences.service.js` rejeita `creditCardId` com tipo `INCOME`.

### Não entram em orçamento
- Orçamentos consideram apenas `type: 'EXPENSE'`. Receitas não afetam orçamento.

### Calendário
- Receitas aparecem no calendário com valores positivos, contribuindo para `projectedBalance`.

---

## 6. Como Faturas São Abertas, Fechadas e Pagas

### Ciclo de vida (status)
```
OPEN → (após closing_date) → OVERDUE/CLOSED* → (após pagamento) → PAID
```

- `computeEffectiveStatus()` (helper) determina o status efetivo:
  - Se `status === 'PAID'` → retorna `PAID`.
  - Se `now > dueDate` → `OVERDUE`.
  - Se `now > closingDate` → `CLOSED`.
  - Senão → `OPEN`.
- O campo `status` no banco só armazena `OPEN` ou `PAID`. `CLOSED` e `OVERDUE` são calculados.

### Abertura (getCurrentInvoices / generateInvoice)
- `getCurrentInvoices()`: para cada cartão ativo, busca fatura do mês corrente. Se não existir, **cria automaticamente** com status `OPEN` e `totalAmount` calculado.
- `generateInvoice()`: cria ou atualiza (upsert) uma fatura. **Não permite recalcular fatura PAID** (erro 422).

### Fechamento
- Uma fatura torna-se `CLOSED` (efetivamente) quando `now > closingDate`.
- Nenhuma ação explícita de "fechamento" é executada — o status é calculado em tempo real.

### Pagamento (payInvoice)
1. Valida que fatura não está PAID.
2. Valida conta de pagamento.
3. **Cria transação EXPENSE** na conta com `source: 'CREDIT_CARD_PAYMENT'`.
4. Atualiza fatura: `status = 'PAID'`, `paidAmount`, `paidAt`, `paymentAccountId`, `paymentTransactionId`.
5. **Apenas pagamento integral**: valor parcial rejeitado (erro "Nesta versão o pagamento deve ser do valor total da fatura").

### Cancelamento de pagamento (cancelInvoicePayment)
1. Valida que fatura está PAID.
2. **Soft delete** na transação de pagamento.
3. Reverte fatura: `status = 'OPEN'`, `paidAmount = 0`, `paidAt = null`, remove vínculos.

### Período da fatura
- `buildInvoicePeriod()` calcula `periodStart` (dia após fechamento anterior) e `periodEnd` (data de fechamento atual).
- `safeDay()` ajusta dia de fechamento/vencimento para o último dia do mês se o dia não existir (ex.: 31/fev → 28/fev).

---

## 7. Como Recorrências Geram Lançamentos

### Template vs transação
- Recorrência é um **template**. A transação real só existe após `generateTransaction()`.

### Geração manual
- `generateTransaction()`:
  1. Valida: recorrência `ACTIVE`.
  2. Valida: `nextRunDate <= endDate` (se endDate existir).
  3. **Verifica dedup**: busca transação existente com `(recurrence_id, recurrence_occurrence_date)`.
  4. Cria transação com `source: 'RECURRENCE'`, status conforme `generateAsPaid`, data = `nextRunDate`.
  5. Atualiza `lastRunDate = nextRunDate`, calcula próximo `nextRunDate`.
  6. Se `nextRunDate > endDate`, marca recorrência como `FINISHED`.

### Geração automática
- Recorrências com `autoGenerate: true` devem ser processadas por um job/script separado (não implementado no service atual). O campo existe no schema e na validação.

### Frequências
```
DAILY | WEEKLY | BIWEEKLY | MONTHLY | BIMONTHLY | QUARTERLY | SEMIANNUAL | YEARLY
```
- `calculateNextRunDate()`: trata corretamente meses com menos dias (ex.: 31/jan → 28/fev).

### Validações
- Recorrência não pode ter `accountId` e `creditCardId` simultaneamente.
- Recorrência do tipo INCOME não pode ter `creditCardId`.
- Categoria deve ser compatível com o tipo.

---

## 8. Como o Calendário Trata Previsto vs Confirmado

### Fontes de dados
- **Transações reais**: busca transações do mês com `status !== 'CANCELED'`.
- **Previews de recorrência**: para cada recorrência ACTIVE, calcula as datas de ocorrência no mês via `getRecurringDatesInMonth()`.

### Dedup de previews
- Para cada transação real que tem `recurrence_id`, o calendário registra a chave `(recurrence_id, occurrence_date)`.
- Previews são puladas se já existe transação para `(recurrence_id, date)`.

### Status dos eventos
| Origem | Status no calendário |
|--------|---------------------|
| Transação CONFIRMED | `PAID` |
| Transação PENDING | `PENDING` |
| Preview de recorrência | `SCHEDULED` (kind: `RECURRENCE_PREVIEW`) |

### Resumo mensal
- `totalIncome` / `totalExpense`: tudo (transações + previews).
- `scheduledIncome` / `scheduledExpense`: soma de todos os eventos.
- `paidIncome` / `paidExpense`: soma de eventos com status `PAID`.
- `pendingIncome` / `pendingExpense`: soma de eventos com status `PENDING`.
- `projectedBalance`: `scheduledIncome - scheduledExpense`.

### Regra visual
- Eventos `RECURRENCE_PREVIEW` são marcados como "Previsão" na UI.
- Filtro "Previsões" mostra apenas `kind === 'RECURRENCE_PREVIEW'`.

---

## 9. Riscos de Duplicidade

| Risco | Local | Mitigação |
|-------|-------|-----------|
| Transação de recorrência duplicada | `recurrences.service.js generateTransaction()` | Verifica `(recurrence_id, recurrence_occurrence_date)` único antes de criar |
| Fatura duplicada para mesmo mês/cartão | Schema `CreditCardInvoice` | Unique constraint `@@unique([tenantId, creditCardId, referenceMonth, referenceYear])` |
| Orçamento duplicado para mesma categoria/mês | Schema `Budget` | Unique constraint `@@unique([tenant_id, category_id, month, year])` + validação de negócio |
| Transação manual duplicada | `transactions.service.js` | **Sem proteção**. Risco real: usuário pode cadastrar mesma transação duas vezes |
| Importação duplicada | `imports.service.js` | Verificar se há dedup por `external_id` |
| Pagamento de fatura duplicado | `invoices.service.js payInvoice()` | Valida `status !== 'PAID'` antes de pagar |
| Preview de recorrência duplicado no calendário | `financialCalendar.service.js` | Verifica `(recurrence_id, date)` já transacionado |

---

## 10. Checklist Obrigatório Antes de Mexer em Regra Financeira

- [ ] **Regra alterada está documentada neste arquivo?** Se não, adicione.
- [ ] **Saldo de conta:** A mudança afeta `computeAccountBalances()`? Teste com contas de todos os tipos.
- [ ] **Limite de cartão:** A mudança afeta `getCreditCardExpenseAmountMap()` ou `LIMIT_IMPACTING_STATUSES`? Teste com faturas pagas e abertas.
- [ ] **Fatura paga:** A mudança permite recalcular ou pagar fatura já PAID? Deve ser bloqueado.
- [ ] **Dedup de recorrência:** A mudança quebra a unicidade de `(recurrence_id, recurrence_occurrence_date)`?
- [ ] **Soft delete:** Toda exclusão usa `deleted_at`? Nenhum `prisma.delete()`?
- [ ] **Filtro de tenant:** Toda query nova/adicionada tem `tenant_id`?
- [ ] **Transação CREDIT_CARD:** Manteve `account_id = null` e `credit_card_id` preenchido?
- [ ] **Transação normal:** Manteve `account_id` preenchido e `credit_card_id = null`?
- [ ] **Status CONFIRMED vs PENDING:** A mudança considera corretamente que PENDING não afeta saldo?
- [ ] **Período de fatura:** Testou com `closing_day` > 28 em fevereiro? `safeDay()` garante ajuste?
- [ ] **Calendário previsto vs confirmado:** Preview de recorrência não está substituindo transação real?
- [ ] **Orçamento:** Usa apenas transações EXPENSE + CONFIRMED? O status do orçamento (SAFE/WARNING/EXCEEDED) está correto?
- [ ] **Plano FREE:** Respeita `planService.assertCanCreate*()` e limites do plano?
- [ ] **Valor monetário:** Usa `Decimal(18,2)` ou `toDecimalString()`? Nunca `Float`?
- [ ] **Zod validation:** Toda nova rota tem schema de validação?
- [ ] **Teste de regressão:** Rodou pelo menos os cenários de saldo, limite, fatura e recorrência?

---

## Arquivos Usados como Referência

- `backend/prisma/schema.prisma` — Modelos Account, CreditCard, CreditCardInvoice, Transaction, Recurrence, Budget
- `backend/src/modules/accounts/accounts.service.js` — Cálculo de saldo, CRUD de contas
- `backend/src/modules/accounts/accounts.validation.js` — Validação Zod de contas
- `backend/src/modules/credit-cards/credit-cards.service.js` — Cálculo de limite, CRUD de cartões
- `backend/src/modules/credit-cards/credit-cards.validation.js` — Validação Zod de cartões
- `backend/src/modules/transactions/transactions.service.js` — CRUD de transações, resumo mensal
- `backend/src/modules/transactions/transactions.validation.js` — Validação Zod de transações
- `backend/src/modules/invoices/invoices.service.js` — Ciclo de vida de faturas (abrir, pagar, cancelar)
- `backend/src/modules/invoices/invoices.helper.js` — Cálculo de período, status efetivo
- `backend/src/modules/invoices/invoices.validation.js` — Validação Zod de faturas
- `backend/src/modules/recurrences/recurrences.service.js` — Geração de transações recorrentes
- `backend/src/modules/recurrences/recurrences.validation.js` — Validação Zod de recorrências
- `backend/src/modules/financial-calendar/financialCalendar.service.js` — Calendário financeiro (previsto vs confirmado)
- `backend/src/modules/budgets/budgets.service.js` — Orçamentos por categoria
- `backend/src/utils/credit-card-limit.js` — Cálculo de usedAmount por cartão
- `backend/src/config/planLimits.js` — Limites por plano
- `backend/src/modules/plans/plan.service.js` — Assertions de limite de plano
- `frontend/src/components/creditCards/CreditCardSummary.jsx` — Exibição de resumo de cartões
- `frontend/src/components/creditCards/CreditCardForm.jsx` — Formulário de cartão
- `frontend/src/pages/FinancialCalendarPage.jsx` — UI do calendário financeiro
- `PROJECT_RULES.md` — Regras gerais do projeto (seção 6 e 7)
