const mockPrisma = {
  creditCard: {
    findMany: jest.fn()
  }
};

const mockGetCreditCardExpenseAmountMap = jest.fn();

jest.mock('../config/prisma', () => mockPrisma);
jest.mock('../utils/credit-card-limit', () => ({
  getCreditCardExpenseAmountMap: mockGetCreditCardExpenseAmountMap
}));
jest.mock('../modules/plans/plan.service', () => ({
  assertCanCreateCreditCard: jest.fn()
}));

const { listCreditCards } = require('../modules/credit-cards/credit-cards.service');

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const CARD_A = '22222222-2222-4222-8222-222222222222';
const CARD_B = '33333333-3333-4333-8333-333333333333';

function creditCard(id, limitAmount) {
  return {
    id,
    name: `Cartao ${id}`,
    brand: 'MASTERCARD',
    limit_amount: limitAmount,
    closing_day: 10,
    due_day: 20,
    color: '#000000',
    is_active: true,
    account: null,
    created_at: new Date('2026-07-01T12:00:00Z'),
    updated_at: new Date('2026-07-01T12:00:00Z')
  };
}

describe('listCreditCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usa o comprometimento total sem faixa mensal para todos os cartoes ativos', async () => {
    mockPrisma.creditCard.findMany.mockResolvedValue([
      creditCard(CARD_A, '1066.00'),
      creditCard(CARD_B, '500.00')
    ]);
    mockGetCreditCardExpenseAmountMap.mockResolvedValue(new Map([
      [CARD_A, 200.72],
      [CARD_B, 100]
    ]));

    const result = await listCreditCards(TENANT_ID);

    expect(mockGetCreditCardExpenseAmountMap).toHaveBeenCalledWith(
      mockPrisma,
      TENANT_ID,
      [CARD_A, CARD_B],
      { excludePaidInvoices: true }
    );
    expect(result[0]).toEqual(expect.objectContaining({
      usedAmount: 200.72,
      availableLimit: 865.28,
      usagePercentage: 18.83
    }));
    expect(result[0]).not.toHaveProperty('currentInvoiceAmount');
  });

  it('nao permite que credito excedente eleve o disponivel acima do limite', async () => {
    mockPrisma.creditCard.findMany.mockResolvedValue([creditCard(CARD_A, '1066.00')]);
    mockGetCreditCardExpenseAmountMap.mockResolvedValue(new Map([[CARD_A, -50]]));

    const [result] = await listCreditCards(TENANT_ID);

    expect(result.usedAmount).toBe(0);
    expect(result.availableLimit).toBe(1066);
    expect(result.usagePercentage).toBe(0);
  });
});
