jest.mock('../config/prisma', () => ({
  account: {
    findMany: jest.fn()
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

describe('computeTotalBalance', () => {
  it('deve retornar 0 quando nao ha contas', async () => {
    prismaMock.account.findMany.mockResolvedValue([]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(0);
  });

  it('deve somar o current_balance de todas as contas retornadas', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 },
      { current_balance: 200 },
      { current_balance: 150 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(850);
  });

  it('deve filtrar apenas contas com consider_in_available_balance=true', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 },
      { current_balance: 200 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(700);
    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          consider_in_available_balance: true
        })
      })
    );
  });

  it('deve filtrar apenas contas ativas', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 },
      { current_balance: 200 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(700);
    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_active: true
        })
      })
    );
  });

  it('deve filtrar contas com deleted_at=null', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(500);
    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deleted_at: null
        })
      })
    );
  });

  it('deve lidar com saldos negativos', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 },
      { current_balance: -200 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(300);
  });

  it('deve tratar current_balance nulo como 0', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 500 },
      { current_balance: null },
      { current_balance: undefined }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(500);
  });

  it('desmarcar conta deve diminuir o saldo total, nunca aumentar', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 3000 },
      { current_balance: 200 },
      { current_balance: 1500 }
    ]);

    const resultBefore = await computeTotalBalance(TENANT_ID);
    expect(resultBefore).toBe(4700);

    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 3000 },
      { current_balance: 200 }
    ]);

    const resultAfter = await computeTotalBalance(TENANT_ID);
    expect(resultAfter).toBe(3200);

    expect(resultAfter).toBeLessThan(resultBefore);
  });

  it('nunca deve somar valor maior ao remover conta do filtro', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 660.51 }
    ]);

    const resultCompleto = await computeTotalBalance(TENANT_ID);
    expect(resultCompleto).toBe(660.51);

    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 510.51 }
    ]);

    const resultFiltrado = await computeTotalBalance(TENANT_ID);
    expect(resultFiltrado).toBe(510.51);

    expect(resultFiltrado).toBeLessThan(resultCompleto);
  });

  it('deve retornar valor com precisao de 2 casas decimais', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { current_balance: 100.1 },
      { current_balance: 200.2 }
    ]);

    const result = await computeTotalBalance(TENANT_ID);

    expect(result).toBe(300.3);
  });
});
