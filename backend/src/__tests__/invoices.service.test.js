jest.mock('../config/prisma', () => ({
  creditCardInvoice: {
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  account: {
    findFirst: jest.fn()
  },
  transaction: {
    create: jest.fn()
  }
}));

jest.mock('../utils/date-utils', () => ({
  formatDateOnly: (date) => {
    if (!date) return null;
    const d = new Date(date);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },
  parseLocalDate: (dateStr) => new Date(dateStr)
}));

jest.mock('../utils/credit-card-invoice', () => ({
  INVOICE_IMPACTING_STATUSES: ['CONFIRMED', 'PENDING'],
  countInvoicePurchases: jest.fn().mockResolvedValue(0),
  getInvoiceReferenceForDate: jest.fn(),
  recalculateInvoiceTotal: jest.fn((inv) => Promise.resolve(inv)),
  upsertInvoiceForCardPeriod: jest.fn()
}));

jest.mock('../modules/invoices/invoices.helper', () => ({
  computeEffectiveStatus: (inv) => inv.status,
  formatMonthYear: (month, year) => `${month}/${year}`,
  calculateInvoiceAmount: jest.fn()
}));

const prismaMock = require('../config/prisma');
const { payInvoice } = require('../modules/invoices/invoices.service');
const AppError = require('../utils/app-error');

const TENANT_ID = 'tenant-001';
const USER_ID = 'user-001';
const INVOICE_ID = 'invoice-001';
const ACCOUNT_ID = 'account-001';
const CREDIT_CARD_ID = 'card-001';

function makeInvoice(overrides = {}) {
  return {
    id: INVOICE_ID,
    tenantId: TENANT_ID,
    creditCardId: CREDIT_CARD_ID,
    creditCard: {
      id: CREDIT_CARD_ID,
      name: 'Nubank',
      brand: 'MASTERCARD',
      closing_day: 15,
      due_day: 25,
      color: '#8A05BE'
    },
    referenceMonth: 7,
    referenceYear: 2026,
    periodStart: new Date('2026-06-15'),
    periodEnd: new Date('2026-07-15'),
    closingDate: new Date('2026-07-15'),
    dueDate: new Date('2026-07-25'),
    totalAmount: 1500.50,
    paidAmount: 0,
    status: 'CLOSED',
    paidAt: null,
    paymentAccountId: null,
    paymentTransactionId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

function makeAccount(overrides = {}) {
  return {
    id: ACCOUNT_ID,
    tenant_id: TENANT_ID,
    name: 'Conta Corrente',
    type: 'CHECKING',
    is_active: true,
    currentBalance: 5000,
    ...overrides
  };
}

describe('payInvoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve pagar fatura FECHADA com sucesso', async () => {
    const invoice = makeInvoice({ status: 'CLOSED' });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-001' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID',
      paidAmount: 1500.50,
      paidAt: new Date('2026-07-17'),
      paymentAccountId: ACCOUNT_ID,
      paymentTransactionId: paymentTransaction.id
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    const result = await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    expect(result.status).toBe('PAID');
    expect(result.paidAmount).toBe(1500.50);
  });

  it('deve usar automaticamente invoice.totalAmount como valor do pagamento', async () => {
    const invoice = makeInvoice({ status: 'CLOSED', totalAmount: 2345.67 });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-002' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID',
      paidAmount: 2345.67
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    const transactionCall = prismaMock.transaction.create.mock.calls[0][0];
    expect(transactionCall.data.amount).toBe(2345.67);

    const updateCall = prismaMock.creditCardInvoice.update.mock.calls[0][0];
    expect(updateCall.data.paidAmount).toBe(2345.67);
  });

  it('nao deve aceitar amount no payload (ignora e usa totalAmount)', async () => {
    const invoice = makeInvoice({ status: 'CLOSED', totalAmount: 1000 });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-003' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID',
      paidAmount: 1000
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17',
      amount: 500
    });

    const transactionCall = prismaMock.transaction.create.mock.calls[0][0];
    expect(transactionCall.data.amount).toBe(1000);
  });

  it('deve pagar fatura com status OPEN', async () => {
    const invoice = makeInvoice({ status: 'OPEN' });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-004' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID',
      paidAmount: 1500.50
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    const result = await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    expect(result.status).toBe('PAID');
  });

  it('nao deve permitir pagar fatura ja paga', async () => {
    const invoice = makeInvoice({ status: 'PAID' });

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);

    await expect(
      payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
        accountId: ACCOUNT_ID,
        paymentDate: '2026-07-17'
      })
    ).rejects.toThrow('Fatura já está paga');
  });

  it('deve criar transacao de pagamento com tipo EXPENSE e source CREDIT_CARD_PAYMENT', async () => {
    const invoice = makeInvoice({ status: 'CLOSED' });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-005' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID'
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    const transactionCall = prismaMock.transaction.create.mock.calls[0][0];
    expect(transactionCall.data.type).toBe('EXPENSE');
    expect(transactionCall.data.source).toBe('CREDIT_CARD_PAYMENT');
    expect(transactionCall.data.status).toBe('CONFIRMED');
    expect(transactionCall.data.account_id).toBe(ACCOUNT_ID);
    expect(transactionCall.data.credit_card_id).toBe(CREDIT_CARD_ID);
  });

  it('deve atualizar fatura para status PAID com dados corretos', async () => {
    const invoice = makeInvoice({ status: 'CLOSED' });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-006' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID'
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    const updateCall = prismaMock.creditCardInvoice.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe('PAID');
    expect(updateCall.data.paidAmount).toBe(1500.50);
    expect(updateCall.data.paymentAccountId).toBe(ACCOUNT_ID);
    expect(updateCall.data.paymentTransactionId).toBe(paymentTransaction.id);
  });

  it('nao deve retornar erro de validacao de valor quando amount nao e enviado', async () => {
    const invoice = makeInvoice({ status: 'CLOSED', totalAmount: 500 });
    const account = makeAccount();
    const paymentTransaction = { id: 'tx-payment-007' };

    prismaMock.creditCardInvoice.findFirst.mockResolvedValueOnce(invoice);
    prismaMock.account.findFirst.mockResolvedValueOnce(account);
    prismaMock.transaction.create.mockResolvedValueOnce(paymentTransaction);
    prismaMock.creditCardInvoice.update.mockResolvedValueOnce({
      ...invoice,
      status: 'PAID',
      paidAmount: 500
    });
    prismaMock.creditCardInvoice.count.mockResolvedValueOnce(0);

    const result = await payInvoice(TENANT_ID, INVOICE_ID, USER_ID, {
      accountId: ACCOUNT_ID,
      paymentDate: '2026-07-17'
    });

    expect(result.status).toBe('PAID');
    expect(result.paidAmount).toBe(500);
  });
});
