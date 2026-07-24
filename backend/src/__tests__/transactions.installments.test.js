const records = [];
let createCount = 0;
let failOnCreate = null;

function makeRecord(data) {
  return {
    id: `transaction-${createCount}`,
    ...data,
    category: null,
    account: null,
    credit_card: data.credit_card_id ? { id: data.credit_card_id, name: 'Samsung' } : null,
    deleted_at: data.deleted_at ?? null,
    created_at: new Date('2026-07-24T12:00:00Z'),
    updated_at: new Date('2026-07-24T12:00:00Z')
  };
}

const transactionModel = {
  create: jest.fn(async ({ data }) => {
    createCount += 1;

    if (createCount === failOnCreate) {
      throw new Error('Falha simulada ao criar parcela');
    }

    const record = makeRecord(data);
    records.push(record);
    return record;
  }),
  findFirst: jest.fn(async ({ where }) => records.find((record) => (
    record.id === where.id
      && record.tenant_id === where.tenant_id
      && record.deleted_at === null
  )) || null),
  findMany: jest.fn(async ({ where, orderBy }) => {
    let result = records.filter((record) => record.tenant_id === where.tenant_id && record.deleted_at === null);

    if (where.installment_group_id) {
      result = result.filter((record) => record.installment_group_id === where.installment_group_id);
    }

    if (orderBy?.installment_number) {
      result.sort((left, right) => left.installment_number - right.installment_number);
    }

    return result;
  }),
  updateMany: jest.fn(async ({ where, data }) => {
    const targets = records.filter((record) => (
      record.tenant_id === where.tenant_id
      && record.deleted_at === null
      && (where.installment_group_id
        ? record.installment_group_id === where.installment_group_id
        : record.id === where.id)
    ));

    targets.forEach((record) => Object.assign(record, data));
    return { count: targets.length };
  }),
  update: jest.fn(),
  count: jest.fn(async () => records.filter((record) => record.deleted_at === null).length)
};

const mockPrisma = {
  transaction: transactionModel,
  account: { findFirst: jest.fn() },
  category: { findFirst: jest.fn() },
  creditCardInvoice: { findFirst: jest.fn().mockResolvedValue(null) },
  creditCard: {
    findFirst: jest.fn(async ({ where }) => ({
      id: where.id,
      tenant_id: where.tenant_id,
      name: 'Samsung',
      closing_day: 15,
      due_day: 25
    }))
  },
  $transaction: jest.fn(async (callback) => {
    const snapshot = records.map((record) => ({ ...record }));

    try {
      return await callback(mockPrisma);
    } catch (error) {
      records.splice(0, records.length, ...snapshot);
      throw error;
    }
  })
};

jest.mock('../config/prisma', () => mockPrisma);

const mockSyncTransactionInvoiceChanges = jest.fn().mockResolvedValue(undefined);

jest.mock('../utils/credit-card-invoice', () => ({
  ...jest.requireActual('../utils/credit-card-invoice'),
  syncTransactionInvoiceChanges: mockSyncTransactionInvoiceChanges
}));

const transactionsService = require('../modules/transactions/transactions.service');
const { getInvoiceReferenceForDate } = require('../utils/credit-card-invoice');

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';
const CARD_ID = '33333333-3333-4333-8333-333333333333';

function installmentPayload(overrides = {}) {
  return {
    description: 'mercado livre',
    amount: 200.72,
    type: 'EXPENSE',
    status: 'CONFIRMED',
    transactionDate: new Date(2026, 0, 20, 12),
    paymentMethod: 'CREDIT_CARD',
    accountId: null,
    creditCardId: CARD_ID,
    categoryId: null,
    notes: 'Compra online',
    isInstallment: true,
    installmentTotal: 2,
    ...overrides
  };
}

function activeRecords() {
  return records.filter((record) => record.deleted_at === null);
}

describe('parcelamento de transacoes', () => {
  beforeEach(() => {
    records.splice(0);
    createCount = 0;
    failOnCreate = null;
    jest.clearAllMocks();
    mockSyncTransactionInvoiceChanges.mockResolvedValue(undefined);
  });

  it('gera R$ 200,72 em duas parcelas de R$ 100,36 com descricoes numeradas', async () => {
    await transactionsService.createTransaction(installmentPayload(), TENANT_ID, USER_ID);

    expect(activeRecords()).toHaveLength(2);
    expect(activeRecords().map((record) => record.amount)).toEqual(['100.36', '100.36']);
    expect(activeRecords().map((record) => record.description)).toEqual(['mercado livre 1/2', 'mercado livre 2/2']);
    expect(new Set(activeRecords().map((record) => record.installment_group_id)).size).toBe(1);
  });

  it('distribui centavos de R$ 100,00 em 3x e mantem a soma exata', async () => {
    await transactionsService.createTransaction(installmentPayload({ amount: 100, installmentTotal: 3 }), TENANT_ID, USER_ID);

    expect(activeRecords().map((record) => record.amount)).toEqual(['33.34', '33.33', '33.33']);
    expect(activeRecords().reduce((sum, record) => sum + Math.round(Number(record.amount) * 100), 0)).toBe(10000);
  });

  it('mantem compra a vista como uma unica transacao', async () => {
    await transactionsService.createTransaction(installmentPayload({
      isInstallment: false,
      installmentTotal: undefined
    }), TENANT_ID, USER_ID);

    expect(activeRecords()).toHaveLength(1);
    expect(activeRecords()[0].amount).toBe('200.72');
    expect(activeRecords()[0].installment_group_id).toBeNull();
  });

  it('gera datas mensais que pertencem a faturas consecutivas', async () => {
    await transactionsService.createTransaction(installmentPayload({ installmentTotal: 3 }), TENANT_ID, USER_ID);

    const references = activeRecords().map((record) => getInvoiceReferenceForDate(15, record.transaction_date));
    expect(references).toEqual([
      { referenceMonth: 2, referenceYear: 2026 },
      { referenceMonth: 3, referenceYear: 2026 },
      { referenceMonth: 4, referenceYear: 2026 }
    ]);
    expect(mockSyncTransactionInvoiceChanges).toHaveBeenCalledWith(
      TENANT_ID,
      null,
      expect.any(Array),
      mockPrisma,
      { rejectPaidInvoices: true }
    );
  });

  it('substitui o registro legado incorreto sem manter o valor total', async () => {
    createCount = 1;
    records.push(makeRecord({
      tenant_id: TENANT_ID,
      user_id: USER_ID,
      account_id: null,
      credit_card_id: CARD_ID,
      category_id: null,
      description: 'mercado livre',
      amount: '200.72',
      type: 'EXPENSE',
      status: 'CONFIRMED',
      transaction_date: new Date(2026, 0, 20, 12),
      payment_method: 'CREDIT_CARD',
      notes: null,
      source: 'MANUAL',
      is_installment: true,
      installment_number: 2,
      installment_total: 2,
      installment_group_id: null,
      deleted_at: null
    }));

    await transactionsService.updateTransaction('transaction-1', TENANT_ID, installmentPayload());

    expect(activeRecords()).toHaveLength(2);
    expect(activeRecords().map((record) => record.amount)).toEqual(['100.36', '100.36']);
    expect(records.find((record) => record.id === 'transaction-1').deleted_at).toBeInstanceOf(Date);
  });

  it('cria exatamente uma parcela por numero sem duplicacao', async () => {
    await transactionsService.createTransaction(installmentPayload({ installmentTotal: 6 }), TENANT_ID, USER_ID);

    expect(activeRecords().map((record) => record.installment_number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(new Set(activeRecords().map((record) => record.installment_number)).size).toBe(6);
  });

  it('desfaz toda a operacao quando uma parcela falha', async () => {
    failOnCreate = 2;

    await expect(
      transactionsService.createTransaction(installmentPayload({ installmentTotal: 3 }), TENANT_ID, USER_ID)
    ).rejects.toThrow('Falha simulada ao criar parcela');

    expect(activeRecords()).toHaveLength(0);
  });

  it('desfaz as parcelas quando a sincronizacao da fatura falha', async () => {
    mockSyncTransactionInvoiceChanges.mockRejectedValueOnce(new Error('Falha simulada na fatura'));

    await expect(
      transactionsService.createTransaction(installmentPayload(), TENANT_ID, USER_ID)
    ).rejects.toThrow('Falha simulada na fatura');

    expect(activeRecords()).toHaveLength(0);
  });

  it('bloqueia a reconstrucao de parcelas vinculadas a fatura paga', async () => {
    await transactionsService.createTransaction(installmentPayload(), TENANT_ID, USER_ID);
    mockPrisma.creditCardInvoice.findFirst.mockResolvedValueOnce({ id: 'invoice-paid' });

    await expect(
      transactionsService.updateTransaction(activeRecords()[0].id, TENANT_ID, installmentPayload())
    ).rejects.toThrow('Nao e possivel criar ou alterar parcelas vinculadas a uma fatura paga');

    expect(activeRecords()).toHaveLength(2);
  });

  it('nao cria parcelas retroativas em uma fatura paga', async () => {
    mockPrisma.creditCardInvoice.findFirst.mockResolvedValueOnce({ id: 'invoice-paid' });

    await expect(
      transactionsService.createTransaction(installmentPayload(), TENANT_ID, USER_ID)
    ).rejects.toThrow('Nao e possivel criar ou alterar parcelas vinculadas a uma fatura paga');

    expect(activeRecords()).toHaveLength(0);
  });

  it('exclui todas as parcelas do grupo sem deixar registros orfaos', async () => {
    await transactionsService.createTransaction(installmentPayload({ installmentTotal: 3 }), TENANT_ID, USER_ID);

    await transactionsService.deleteTransaction(activeRecords()[1].id, TENANT_ID);

    expect(activeRecords()).toHaveLength(0);
  });

  it.each([
    [10.01, 6],
    [0.99, 7],
    [999999.99, 13]
  ])('mantem a soma de %s em %s parcelas', async (amount, installmentTotal) => {
    await transactionsService.createTransaction(installmentPayload({ amount, installmentTotal }), TENANT_ID, USER_ID);

    const sumInCents = activeRecords().reduce((sum, record) => sum + Math.round(Number(record.amount) * 100), 0);
    expect(sumInCents).toBe(Math.round(amount * 100));
  });

  it('lista as descricoes 1/2 e 2/2', async () => {
    await transactionsService.createTransaction(installmentPayload(), TENANT_ID, USER_ID);
    const result = await transactionsService.listTransactions(TENANT_ID, {
      page: 1,
      limit: 20,
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 11, 31)
    });

    expect(result.data.map((transaction) => transaction.description)).toEqual(['mercado livre 1/2', 'mercado livre 2/2']);
  });
});
