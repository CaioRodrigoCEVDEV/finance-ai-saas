jest.mock('../config/prisma', () => ({
  transaction: { findMany: jest.fn() }
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

const prismaMock = require('../config/prisma');
const { buildFinancialCalendar, normalizeCalendarEvent, buildEventFromTransaction, toNumber } = require('../modules/financial-calendar/financialCalendar.service');

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
    category: overrides.category || { id: 'cat-1', name: 'Salario', color: '#00ff00', type: 'INCOME' },
    account: overrides.account || { id: 'acc-1', name: 'Nubank' },
    credit_card: overrides.credit_card || null
  };
}

describe('buildFinancialCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('retorna apenas transacoes reais (sem previsoes de recorrencia)', async () => {
    const tx1 = makeTransaction({ id: 'tx-1', description: 'Salario' });
    const tx2 = makeTransaction({ id: 'tx-2', description: 'Aluguel', type: 'EXPENSE', amount: 1500 });

    prismaMock.transaction.findMany.mockResolvedValueOnce([tx1, tx2]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(2);
    expect(allEvents.every(e => e.kind === 'TRANSACTION')).toBe(true);
  });

  it('nao inclui recorrencias como eventos fantasma', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(0);
    expect(result.summary.eventCount).toBe(0);
  });

  it('filtra por deleted_at null', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const query = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(query.where.deleted_at).toBeNull();
  });

  it('filtra por tenant_id', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const query = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(query.where.tenant_id).toBe(TENANT_ID);
  });

  it('filtra por faixa de data do mes', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const query = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(query.where.transaction_date.gte).toBeInstanceOf(Date);
    expect(query.where.transaction_date.lte).toBeInstanceOf(Date);
  });

  it('nao exclui status CANCELED (mostra todas as transacoes)', async () => {
    const canceledTx = makeTransaction({ id: 'tx-canceled', status: 'CANCELED' });
    prismaMock.transaction.findMany.mockResolvedValueOnce([canceledTx]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].id).toBe('tx-canceled');
  });

  it('transacao excluida nao entra nos cards superiores', async () => {
    const income = makeTransaction({
      id: 'tx-1',
      type: 'INCOME',
      amount: 3000,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([income]);

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

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result.summary.eventCount).toBe(1);

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].id).toBe('tx-visible');
  });

  it('calculo de saldo diario esta correto', async () => {
    const income = makeTransaction({
      id: 'tx-income',
      type: 'INCOME',
      amount: 1000,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });
    const expense = makeTransaction({
      id: 'tx-expense',
      type: 'EXPENSE',
      amount: 300,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([income, expense]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const day10 = result.days.find(d => d.date === `${YEAR}-07-10`);
    expect(day10).toBeDefined();
    expect(day10.income).toBe(1000);
    expect(day10.expense).toBe(300);
    expect(day10.balance).toBe(700);
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

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    const confirmedEvent = allEvents.find(e => e.id === 'tx-confirmed');
    const pendingEvent = allEvents.find(e => e.id === 'tx-pending');

    expect(confirmedEvent.status).toBe('PAID');
    expect(pendingEvent.status).toBe('PENDING');
  });

  it('inclui _debug com informacoes de comparacao', async () => {
    const tx = makeTransaction({ id: 'tx-debug', amount: 100 });
    prismaMock.transaction.findMany.mockResolvedValueOnce([tx]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result._debug).toBeDefined();
    expect(result._debug.transactionCount).toBe(1);
    expect(result._debug.transactionIds).toContain('tx-debug');
    expect(result._debug.transactionDates).toContain(`${YEAR}-07-05`);
    expect(result._debug.transactionAmounts).toEqual([
      { id: 'tx-debug', amount: 100, type: 'INCOME' }
    ]);
  });

  it('imprime log de debug no console', async () => {
    const tx = makeTransaction({ id: 'tx-log', amount: 250 });
    prismaMock.transaction.findMany.mockResolvedValueOnce([tx]);

    await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(console.log).toHaveBeenCalledWith(
      '[Calendar Debug]',
      expect.any(String)
    );
  });

  it('transferencia enviada aparece negativa e como Transferencia', async () => {
    const transfer = makeTransaction({
      id: 'tx-transfer-out',
      description: 'Transferência para "cofre"',
      type: 'TRANSFER',
      amount: -150,
      account: { id: 'acc-1', name: 'Itaú' },
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 17))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([transfer]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].displayType).toBe('TRANSFER');
    expect(allEvents[0].displayLabel).toBe('Transferência');
    expect(allEvents[0].badgeVariant).toBe('info');
    expect(allEvents[0].transferDirection).toBe('OUTGOING');
    expect(allEvents[0].signedAmountForTotal).toBe(0);
    expect(allEvents[0].absAmount).toBe(150);
  });

  it('transferencia recebida aparece positiva e como Transferencia', async () => {
    const transfer = makeTransaction({
      id: 'tx-transfer-in',
      description: 'Transferência recebida de "Itaú"',
      type: 'TRANSFER',
      amount: 150,
      account: { id: 'acc-2', name: 'Cofre' },
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 17))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([transfer]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0].displayType).toBe('TRANSFER');
    expect(allEvents[0].displayLabel).toBe('Transferência');
    expect(allEvents[0].badgeVariant).toBe('info');
    expect(allEvents[0].transferDirection).toBe('INCOMING');
    expect(allEvents[0].signedAmountForTotal).toBe(0);
    expect(allEvents[0].absAmount).toBe(150);
  });

  it('transferencia em visao global tem impacto liquido zero no total do dia', async () => {
    const transferOut = makeTransaction({
      id: 'tx-transfer-out',
      description: 'Transferência para "cofre"',
      type: 'TRANSFER',
      amount: -500,
      account: { id: 'acc-1', name: 'Itaú' },
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 17))
    });
    const transferIn = makeTransaction({
      id: 'tx-transfer-in',
      description: 'Transferência recebida de "Itaú"',
      type: 'TRANSFER',
      amount: 500,
      account: { id: 'acc-2', name: 'Cofre' },
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 17))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([transferOut, transferIn]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const day17 = result.days.find(d => d.date === `${YEAR}-07-17`);
    expect(day17).toBeDefined();
    expect(day17.income).toBe(0);
    expect(day17.expense).toBe(0);
    expect(day17.balance).toBe(0);
    expect(day17.events).toHaveLength(2);
  });

  it('perna recebida de transferencia nunca recebe badge Despesa nem valor negativo', async () => {
    const transfer = makeTransaction({
      id: 'tx-transfer-in',
      description: 'Transferência recebida de "Itaú"',
      type: 'TRANSFER',
      amount: 150,
      account: { id: 'acc-2', name: 'Cofre' },
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 17))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([transfer]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    const allEvents = result.days.flatMap(d => d.events);
    expect(allEvents[0].displayLabel).not.toBe('Despesa');
    expect(allEvents[0].absAmount).toBe(150);
    expect(allEvents[0].transferDirection).toBe('INCOMING');
  });

  it('transferencia nao contabiliza nos totais scheduledIncome/scheduledExpense', async () => {
    const transfer = makeTransaction({
      id: 'tx-transfer',
      type: 'TRANSFER',
      amount: -200,
      transaction_date: new Date(Date.UTC(YEAR, MONTH - 1, 10))
    });

    prismaMock.transaction.findMany.mockResolvedValueOnce([transfer]);

    const result = await buildFinancialCalendar({ tenantId: TENANT_ID, year: YEAR, month: MONTH });

    expect(result.summary.scheduledIncome).toBe(0);
    expect(result.summary.scheduledExpense).toBe(0);
    expect(result.summary.totalIncome).toBe(0);
    expect(result.summary.totalExpense).toBe(0);
  });
});

describe('normalizeCalendarEvent', () => {
  it('despesa comum aparece negativa e como Despesa', () => {
    const event = {
      id: 'tx-1',
      type: 'EXPENSE',
      amount: 100,
      status: 'PAID',
      title: 'Aluguel'
    };

    const result = normalizeCalendarEvent(event);

    expect(result.displayType).toBe('EXPENSE');
    expect(result.displayLabel).toBe('Despesa');
    expect(result.badgeVariant).toBe('danger');
    expect(result.signedAmountForTotal).toBe(-100);
    expect(result.absAmount).toBe(100);
    expect(result.transferDirection).toBeNull();
  });

  it('receita comum aparece positiva e como Receita', () => {
    const event = {
      id: 'tx-2',
      type: 'INCOME',
      amount: 5000,
      status: 'PAID',
      title: 'Salário'
    };

    const result = normalizeCalendarEvent(event);

    expect(result.displayType).toBe('INCOME');
    expect(result.displayLabel).toBe('Receita');
    expect(result.badgeVariant).toBe('success');
    expect(result.signedAmountForTotal).toBe(5000);
    expect(result.absAmount).toBe(5000);
    expect(result.transferDirection).toBeNull();
  });

  it('transferencia enviada aparece negativa e como Transferencia', () => {
    const event = {
      id: 'tx-3',
      type: 'TRANSFER',
      amount: -150,
      status: 'CONFIRMED',
      title: 'Transferência para "cofre"'
    };

    const result = normalizeCalendarEvent(event);

    expect(result.displayType).toBe('TRANSFER');
    expect(result.displayLabel).toBe('Transferência');
    expect(result.badgeVariant).toBe('info');
    expect(result.signedAmountForTotal).toBe(0);
    expect(result.absAmount).toBe(150);
    expect(result.transferDirection).toBe('OUTGOING');
  });

  it('transferencia recebida aparece positiva e como Transferencia', () => {
    const event = {
      id: 'tx-4',
      type: 'TRANSFER',
      amount: 150,
      status: 'CONFIRMED',
      title: 'Transferência recebida de "Itaú"'
    };

    const result = normalizeCalendarEvent(event);

    expect(result.displayType).toBe('TRANSFER');
    expect(result.displayLabel).toBe('Transferência');
    expect(result.badgeVariant).toBe('info');
    expect(result.signedAmountForTotal).toBe(0);
    expect(result.absAmount).toBe(150);
    expect(result.transferDirection).toBe('INCOMING');
  });

  it('transferencia em visao global nao entra como despesa e tem impacto liquido zero', () => {
    const outgoing = normalizeCalendarEvent({
      id: 'tx-5',
      type: 'TRANSFER',
      amount: -300,
      status: 'CONFIRMED',
      title: 'Transferência enviada'
    });

    const incoming = normalizeCalendarEvent({
      id: 'tx-6',
      type: 'TRANSFER',
      amount: 300,
      status: 'CONFIRMED',
      title: 'Transferência recebida'
    });

    expect(outgoing.signedAmountForTotal + incoming.signedAmountForTotal).toBe(0);
    expect(outgoing.displayType).toBe('TRANSFER');
    expect(incoming.displayType).toBe('TRANSFER');
  });
});

describe('buildEventFromTransaction', () => {
  it('inclui transferId quando transaction tem transfer_id', () => {
    const transaction = {
      id: 'tx-1',
      description: 'Teste',
      amount: 100,
      type: 'TRANSFER',
      status: 'CONFIRMED',
      transaction_date: new Date(Date.UTC(2026, 6, 17)),
      transfer_id: 'transfer-uuid-123',
      category: null,
      account: { id: 'acc-1', name: 'Conta' },
      credit_card: null
    };

    const event = buildEventFromTransaction(transaction);

    expect(event.transferId).toBe('transfer-uuid-123');
  });

  it('transferId é null quando nao tem transfer_id', () => {
    const transaction = {
      id: 'tx-2',
      description: 'Teste',
      amount: 100,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      transaction_date: new Date(Date.UTC(2026, 6, 17)),
      transfer_id: null,
      category: null,
      account: null,
      credit_card: null
    };

    const event = buildEventFromTransaction(transaction);

    expect(event.transferId).toBeNull();
  });
});
