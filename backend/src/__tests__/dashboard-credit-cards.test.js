jest.mock('../config/prisma', () => ({}));

jest.mock('../modules/credit-cards/credit-cards.service', () => ({
  listCreditCards: jest.fn()
}));

jest.mock('../modules/invoices/invoices.service', () => ({
  getCurrentInvoices: jest.fn()
}));

const creditCardsService = require('../modules/credit-cards/credit-cards.service');
const invoicesService = require('../modules/invoices/invoices.service');
const { getCreditCardOverview } = require('../modules/dashboard/dashboard-service');

const TENANT_ID = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCreditCardOverview', () => {
  it('consolida os mesmos limites dos cartoes ativos com precisao monetaria', async () => {
    creditCardsService.listCreditCards.mockResolvedValue([
      {
        id: '22222222-2222-4222-8222-222222222222',
        isActive: true,
        limitAmount: 544,
        usedAmount: 271.92,
        availableLimit: 272.08
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        isActive: true,
        limitAmount: 1066,
        usedAmount: 1066,
        availableLimit: 0
      }
    ]);
    invoicesService.getCurrentInvoices.mockResolvedValue([
      { creditCardId: '22222222-2222-4222-8222-222222222222', totalAmount: 120.36 },
      { creditCardId: '33333333-3333-4333-8333-333333333333', totalAmount: 50.25 }
    ]);

    const result = await getCreditCardOverview(TENANT_ID);

    expect(result).toEqual({
      totalCards: 2,
      activeCards: 2,
      totalLimit: 1610,
      usedLimitAmount: 1337.92,
      currentInvoiceAmount: 170.61,
      availableLimit: 272.08,
      usagePercentage: 83.1
    });
  });

  it('usa diretamente as fontes de cartoes e faturas do tenant autenticado', async () => {
    creditCardsService.listCreditCards.mockResolvedValue([]);
    invoicesService.getCurrentInvoices.mockResolvedValue([]);

    await getCreditCardOverview(TENANT_ID);

    expect(creditCardsService.listCreditCards).toHaveBeenCalledWith(TENANT_ID);
    expect(invoicesService.getCurrentInvoices).toHaveBeenCalledWith(TENANT_ID);
  });

  it('mantem credito de fatura sem permitir percentual negativo', async () => {
    creditCardsService.listCreditCards.mockResolvedValue([
      { id: 'card-1', isActive: true, limitAmount: 500, usedAmount: 0, availableLimit: 500 }
    ]);
    invoicesService.getCurrentInvoices.mockResolvedValue([
      { creditCardId: 'card-1', totalAmount: -25.5 }
    ]);

    const result = await getCreditCardOverview(TENANT_ID);

    expect(result).toEqual(expect.objectContaining({
      usedLimitAmount: 0,
      currentInvoiceAmount: -25.5,
      availableLimit: 500,
      usagePercentage: 0
    }));
  });
});
