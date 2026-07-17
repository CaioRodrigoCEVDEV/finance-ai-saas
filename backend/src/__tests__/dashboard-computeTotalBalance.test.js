jest.mock('../config/prisma', () => ({
  account: {
    findMany: jest.fn()
  },
  transaction: {
    groupBy: jest.fn()
  }
}));

jest.mock('../modules/dashboard/dashboard-date-helper', () => ({
  formatMonthKey: jest.fn(),
  getLastMonths: jest.fn(),
  resolveDashboardPeriod: jest.fn()
}));

jest.mock('../utils/credit-card-limit', () => ({
  getCreditCardExpenseAmountMap: jest.fn()
}));

jest.mock('../utils/credit-card-invoice', () => ({
  calculateCreditCardBillingPeriod: jest.fn(),
  calculateInvoiceAmountForCards: jest.fn()
}));

jest.mock('../utils/date-utils', () => ({
  formatDateOnly: jest.fn()
}));

const prismaMock = require('../config/prisma');
const { computeTotalBalance } = require('../modules/dashboard/dashboard-service');

const TENANT_ID = 'tenant-001';

beforeEach(() => {
  jest.clearAllMocks();
});

function mockAccountsAndTransactions(accounts, transactions = []) {
  prismaMock.account.findMany.mockResolvedValue(accounts);
  prismaMock.transaction.groupBy.mockResolvedValue(transactions);
}

describe('computeTotalBalance', () => {
  it('deve retornar 0 quando nao ha contas', async () => {
    mockAccountsAndTransactions([]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(0);
    expect(prismaMock.transaction.groupBy).not.toHaveBeenCalled();
  });

  it('deve calcular saldo = initial_balance + INCOME - EXPENSE', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 1000 },
        { id: 'acc-2', initial_balance: 500 }
      ],
      [
        { account_id: 'acc-1', type: 'INCOME', _sum: { amount: 300 } },
        { account_id: 'acc-1', type: 'EXPENSE', _sum: { amount: 200 } },
        { account_id: 'acc-2', type: 'INCOME', _sum: { amount: 100 } }
      ]
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(1700);
  });

  it('deve filtrar apenas contas com consider_in_available_balance=true', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 500 }
      ],
      []
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(500);
    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          consider_in_available_balance: true
        })
      })
    );
  });

  it('deve filtrar apenas contas ativas', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 500 }
      ],
      []
    );

    await computeTotalBalance(TENANT_ID);

    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_active: true
        })
      })
    );
  });

  it('deve filtrar contas com deleted_at=null', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 500 }
      ],
      []
    );

    await computeTotalBalance(TENANT_ID);

    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deleted_at: null
        })
      })
    );
  });

  it('deve buscar transacoes confirmadas sem filtro de data', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 500 }
      ],
      []
    );

    await computeTotalBalance(TENANT_ID);

    expect(prismaMock.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'CONFIRMED'
        })
      })
    );
  });

  it('deve tratar TRANSFER negativa como despesa e positiva como receita', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 1000 }
      ],
      [
        { account_id: 'acc-1', type: 'TRANSFER', _sum: { amount: -200 } },
        { account_id: 'acc-1', type: 'TRANSFER', _sum: { amount: 300 } }
      ]
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(1100);
  });

  it('deve lidar com contas sem transacoes', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 500 },
        { id: 'acc-2', initial_balance: 300 }
      ],
      []
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(800);
  });

  it('deve lidar com saldos negativos', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 100 }
      ],
      [
        { account_id: 'acc-1', type: 'EXPENSE', _sum: { amount: 500 } }
      ]
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(-400);
  });

  it('desmarcar conta deve diminuir o saldo total, nunca aumentar', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 3000 },
        { id: 'acc-2', initial_balance: 200 },
        { id: 'acc-3', initial_balance: 1500 }
      ],
      []
    );

    const resultBefore = await computeTotalBalance(TENANT_ID);
    expect(resultBefore).toBe(4700);

    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 3000 },
        { id: 'acc-2', initial_balance: 200 }
      ],
      []
    );

    const resultAfter = await computeTotalBalance(TENANT_ID);
    expect(resultAfter).toBe(3200);

    expect(resultAfter).toBeLessThan(resultBefore);
  });

  it('deve retornar o valor com precisao de 2 casas decimais', async () => {
    mockAccountsAndTransactions(
      [
        { id: 'acc-1', initial_balance: 100.1 }
      ],
      [
        { account_id: 'acc-1', type: 'INCOME', _sum: { amount: 200.2 } }
      ]
    );

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(300.3);
  });
});
