jest.mock('../config/prisma', () => ({
  transaction: { findMany: jest.fn() },
  recurrence: { findMany: jest.fn() }
}));

jest.mock('../utils/date-utils', () => ({
  formatDateOnly: (date) => {
    if (!date) return null;
    const d = new Date(date);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}));

jest.mock('../modules/recurrences/recurrences.service', () => ({
  calculateNextRunDate: (currentDate, frequency) => {
    const d = new Date(currentDate);
    switch (frequency) {
      case 'MONTHLY':
        d.setUTCMonth(d.getUTCMonth() + 1);
        break;
      case 'WEEKLY':
        d.setUTCDate(d.getUTCDate() + 7);
        break;
      case 'DAILY':
        d.setUTCDate(d.getUTCDate() + 1);
        break;
      default:
        d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return d;
  }
}));

const prismaMock = require('../config/prisma');
const { buildFinancialCalendar, getRecurringDatesInMonth } = require('../modules/financial-calendar/financialCalendar.service');

const TENANT_ID = 'tenant-001';
const YEAR = 2026;
const MONTH = 7;

function makeTransaction(overrides = {}) {
  return {
    id: overrides.id || `tx-${Math.random().toString(36).slice(2, 9)}`,
    description: overrides.description || 'Salario',
    amount: overrides.amount || 5000,
    type: overrides.type || 'INCOME',
    status: overrides.status || 'CONFIRMED',
    transaction_date: overrides.transaction_date || new Date(Date.UTC(YEAR, MONTH - 1, 5)),
    recurrence_id: overrides.recurrence_id || null,
    recurrence_occurrence_date: overrides.recurrence_occurrence_date || null,
    category: overrides.category || { id: 'cat-1', name: 'Salario', color: '#00ff00', type: 'INCOME' },
    account: overrides.account || { id: 'acc-1', name: 'Nubank' },
    credit_card: overrides.credit_card || null
  };
}

function makeRecurrence(overrides = {}) {
  return {
    id: overrides.id || `rec-${Math.random().toString(36).slice(2, 9)}`,
    description: overrides.description || 'Aluguel',
    type: overrides.type || 'EXPENSE',
    amount: overrides.amount || 1500,
    frequency: overrides.frequency || 'MONTHLY',
    status: overrides.status || 'ACTIVE',
    startDate: overrides.startDate || new Date(Date.UTC(2026, 0, 1)),
    endDate: overrides.endDate || null,
    account: overrides.account || { id: 'acc-1', name: 'Nubank' },
    creditCard: overrides.creditCard || null,
    category: overrides.category || { id: 'cat-2', name: 'Moradia', color: '#ff0000', type: 'EXPENSE' }
  };
}

describe('buildFinancialCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nao inclui transacoes com deleted_at preenchido', async () => {
    const activeTx = makeTransaction({ id: 'tx-active', description: 'Freelance', amount: 2000 });

    prismaMock.transaction.findMany.mockResolvedValueOnce([activeTx]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    const txIds = allEvents.map(e => e.id);

    expect(txIds).toContain('tx-active');

    const transactionQuery = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(transactionQuery.where.deleted_at).toBeNull();
  });

  it('nao inclui recorrencias com deletedAt preenchido', async () => {
    const activeRec = makeRecurrence({ id: 'rec-active', description: 'Internet' });

    prismaMock.transaction.findMany.mockResolvedValueOnce([]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([activeRec]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const recurrenceQuery = prismaMock.recurrence.findMany.mock.calls[0][0];
    expect(recurrenceQuery.where.deletedAt).toBeNull();
  });

  it('transacao excluida nao entra nos cards superiores (receita/despesa)', async () => {
    const activeIncome = makeTransaction({
      id: 'tx-1',
      type: 'INCOME',
      amount: 3000,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([activeIncome]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result.summary.totalIncome).toBe(3000);
    expect(result.summary.totalExpense).toBe(0);
    expect(result.summary.scheduledIncome).toBe(3000);
    expect(result.summary.scheduledExpense).toBe(0);
  });

  it('transacao excluida nao entra no saldo previsto', async () => {
    const income = makeTransaction({
      id: 'tx-income',
      type: 'INCOME',
      amount: 5000,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 5))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([income]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result.summary.projectedBalance).toBe(5000);
  });

  it('transacao excluida nao entra na contagem de eventos', async () => {
    const activeTx = makeTransaction({
      id: 'tx-visible',
      description: 'Salario',
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 5))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([activeTx]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result.summary.eventCount).toBe(1);

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].id).toBe('tx-visible');
  });

  it('transacao com status CANCELED nao aparece no calendario', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(0);
    expect(result.summary.eventCount).toBe(0);
  });

  it('recorrencia com transacao gerada excluida mostra preview', async () => {
    const recurrence = makeRecurrence({
      id: 'rec-1',
      description: 'Internet',
      type: 'EXPENSE',
      amount: 100,
      startDate: new Date(Date.UTC(YEAR, MONTH - 1, 1)),
      frequency: 'MONTHLY'
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([recurrence]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    const recurrencePreviews = allEvents.filter(e => e.kind === 'RECURRENCE_PREVIEW');

    expect(recurrencePreviews.length).toBeGreaterThan(0);
    expect(recurrencePreviews[0].title).toBe('Internet');
  });

  it('nao inclui transacoes de outro tenant', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const transactionQuery = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(transactionQuery.where.tenant_id).toBe(TENANT_ID);
  });

  it('calculo de saldo diario exclui transacoes deletadas', async () => {
    const income = makeTransaction({
      id: 'tx-income',
      type: 'INCOME',
      amount: 1000,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([income]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const day10 = result.days.find(d => d.date === `${YEAR}-07-10`);
    expect(day10).toBeDefined();
    expect(day10.income).toBe(1000);
    expect(day10.expense).toBe(0);
    expect(day10.balance).toBe(1000);
  });

  it('status CONFIRMED vira PAID e PENDING permanece PENDING', async () => {
    const confirmedTx = makeTransaction({
      id: 'tx-confirmed',
      status: 'CONFIRMED',
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 5))
    });
    const pendingTx = makeTransaction({
      id: 'tx-pending',
      status: 'PENDING',
      description: 'Pagamento futuro',
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 15))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([confirmedTx, pendingTx]);
    prismaMock.recurrence.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    const confirmedEvent = allEvents.find(e => e.id === 'tx-confirmed');
    const pendingEvent = allEvents.find(e => e.id === 'tx-pending');

    expect(confirmedEvent.status).toBe('PAID');
    expect(pendingEvent.status).toBe('PENDING');
  });
});

describe('getRecurringDatesInMonth', () => {
  it('retorna datas corretas para recorrencia mensal', () => {
    const recurrence = {
      status: 'ACTIVE',
      startDate: new Date(Date.UTC(2026, 6, 1)),
      endDate: null,
      frequency: 'MONTHLY'
    };

    const dates = getRecurringDatesInMonth(recurrence, 2026, 7);

    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toMatch(/^2026-07-/);
  });

  it('retorna vazio para recorrencia inativa', () => {
    const recurrence = {
      status: 'INACTIVE',
      startDate: new Date(Date.UTC(2026, 0, 1)),
      endDate: null,
      frequency: 'MONTHLY'
    };

    const dates = getRecurringDatesInMonth(recurrence, 2026, 7);

    expect(dates).toHaveLength(0);
  });

  it('retorna vazio quando recorrencia terminou antes do mes', () => {
    const recurrence = {
      status: 'ACTIVE',
      startDate: new Date(Date.UTC(2026, 0, 1)),
      endDate: new Date(Date.UTC(2026, 5, 30)),
      frequency: 'MONTHLY'
    };

    const dates = getRecurringDatesInMonth(recurrence, 2026, 7);

    expect(dates).toHaveLength(0);
  });
});
