const {
  buildCreditCardNetWhere,
  getCreditCardExpenseAmountMap
} = require('../utils/credit-card-limit');

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const CARD_ID = '22222222-2222-4222-8222-222222222222';

function transaction(amount, transactionDate, overrides = {}) {
  return {
    credit_card_id: CARD_ID,
    amount,
    type: 'EXPENSE',
    transaction_date: transactionDate,
    created_at: new Date('2026-07-01T12:00:00Z'),
    ...overrides
  };
}

function database(transactions, paidInvoices = []) {
  return {
    transaction: {
      findMany: jest.fn().mockResolvedValue(transactions)
    },
    creditCardInvoice: {
      findMany: jest.fn().mockResolvedValue(paidInvoices)
    }
  };
}

describe('limite comprometido do cartao', () => {
  it('considera imediatamente a parcela atual e a futura de uma compra de R$ 200,00', async () => {
    const prisma = database([
      transaction('100.00', new Date('2026-07-10T12:00:00Z')),
      transaction('100.00', new Date('2026-08-10T12:00:00Z'))
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID, {
      excludePaidInvoices: true
    });

    expect(result.get(CARD_ID)).toBe(200);
    expect(prisma.transaction.findMany.mock.calls[0][0].where.transaction_date).toBeUndefined();
  });

  it('mantem exatamente R$ 200,72 comprometidos em duas parcelas', async () => {
    const prisma = database([
      transaction('100.36', new Date('2026-07-10T12:00:00Z')),
      transaction('100.36', new Date('2026-08-10T12:00:00Z'))
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID);

    expect(result.get(CARD_ID)).toBe(200.72);
  });

  it('considera uma compra a vista em aberto pelo valor integral', async () => {
    const prisma = database([
      transaction('349.90', new Date('2026-07-10T12:00:00Z'))
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID);

    expect(result.get(CARD_ID)).toBe(349.9);
  });

  it('libera somente as transacoes da fatura integralmente paga', async () => {
    const currentInstallmentDate = new Date('2026-07-10T12:00:00Z');
    const futureInstallmentDate = new Date('2026-08-10T12:00:00Z');
    const prisma = database([
      transaction('100.00', currentInstallmentDate),
      transaction('100.00', futureInstallmentDate)
    ], [{
      creditCardId: CARD_ID,
      periodStart: new Date('2026-07-01T00:00:00Z'),
      periodEnd: new Date('2026-07-31T23:59:59Z'),
      paidAt: new Date('2026-08-01T12:00:00Z')
    }]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID, {
      excludePaidInvoices: true
    });

    expect(result.get(CARD_ID)).toBe(100);
  });

  it('volta a comprometer o limite quando o pagamento da fatura e cancelado', async () => {
    const prisma = database([
      transaction('100.00', new Date('2026-07-10T12:00:00Z')),
      transaction('100.00', new Date('2026-08-10T12:00:00Z'))
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID, {
      excludePaidInvoices: true
    });

    expect(result.get(CARD_ID)).toBe(200);
  });

  it('mantem no limite uma compra retroativa criada depois do pagamento', async () => {
    const prisma = database([
      transaction('80.00', new Date('2026-07-10T12:00:00Z'), {
        created_at: new Date('2026-08-02T12:00:00Z')
      })
    ], [{
      creditCardId: CARD_ID,
      periodStart: new Date('2026-07-01T00:00:00Z'),
      periodEnd: new Date('2026-07-31T23:59:59Z'),
      paidAt: new Date('2026-08-01T12:00:00Z')
    }]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID, {
      excludePaidInvoices: true
    });

    expect(result.get(CARD_ID)).toBe(80);
  });

  it('subtrai estornos e creditos uma unica vez', async () => {
    const prisma = database([
      transaction('200.00', new Date('2026-07-10T12:00:00Z')),
      transaction('75.25', new Date('2026-07-11T12:00:00Z'), { type: 'INCOME' })
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID);

    expect(result.get(CARD_ID)).toBe(124.75);
  });

  it('preserva os centavos ao compensar valores acima do inteiro seguro do JavaScript', async () => {
    const prisma = database([
      transaction('90071992547409.90', new Date('2026-07-10T12:00:00Z')),
      transaction('90071992547409.89', new Date('2026-07-11T12:00:00Z'), { type: 'INCOME' })
    ]);

    const result = await getCreditCardExpenseAmountMap(prisma, TENANT_ID, CARD_ID);

    expect(result.get(CARD_ID)).toBe(0.01);
  });

  it('filtra canceladas, excluidas e pagamentos de fatura na consulta', () => {
    const where = buildCreditCardNetWhere(TENANT_ID, CARD_ID);

    expect(where).toEqual(expect.objectContaining({
      tenant_id: TENANT_ID,
      credit_card_id: CARD_ID,
      deleted_at: null,
      status: { in: ['CONFIRMED', 'PENDING'] },
      type: { in: ['EXPENSE', 'INCOME'] },
      source: { not: 'CREDIT_CARD_PAYMENT' }
    }));
  });
});
