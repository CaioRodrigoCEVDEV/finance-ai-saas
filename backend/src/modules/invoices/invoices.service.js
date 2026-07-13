const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { formatDateOnly, parseLocalDate } = require('../../utils/date-utils');
const {
  INVOICE_IMPACTING_STATUSES,
  countInvoicePurchases,
  getInvoiceReferenceForDate,
  recalculateInvoiceTotal,
  upsertInvoiceForCardPeriod
} = require('../../utils/credit-card-invoice');
const { computeEffectiveStatus, formatMonthYear, calculateInvoiceAmount } = require('./invoices.helper');

function toInvoiceResponse(invoice) {
  return {
    id: invoice.id,
    creditCardId: invoice.creditCardId,
    creditCard: invoice.creditCard ? {
      id: invoice.creditCard.id,
      name: invoice.creditCard.name,
      brand: invoice.creditCard.brand,
      closingDay: invoice.creditCard.closingDay,
      dueDay: invoice.creditCard.dueDay,
      color: invoice.creditCard.color
    } : null,
    referenceMonth: invoice.referenceMonth,
    referenceYear: invoice.referenceYear,
    referenceLabel: formatMonthYear(invoice.referenceMonth, invoice.referenceYear),
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    closingDate: invoice.closingDate,
    dueDate: invoice.dueDate,
    totalAmount: Number(invoice.totalAmount),
    paidAmount: Number(invoice.paidAmount),
    status: invoice.status,
    effectiveStatus: computeEffectiveStatus(invoice),
    paidAt: invoice.paidAt ? formatDateOnly(invoice.paidAt) : null,
    paymentAccountId: invoice.paymentAccountId,
    paymentAccount: invoice.paymentAccount ? {
      id: invoice.paymentAccount.id,
      name: invoice.paymentAccount.name,
      type: invoice.paymentAccount.type
    } : null,
    paymentTransactionId: invoice.paymentTransactionId,
    notes: invoice.notes,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt
  };
}

async function findCreditCardByTenant(tenantId, creditCardId) {
  const card = await prisma.creditCard.findFirst({
    where: { id: creditCardId, tenant_id: tenantId, deleted_at: null }
  });
  if (!card) throw new AppError('Cartão não encontrado', 404);
  return card;
}

async function findAccountByTenant(tenantId, accountId) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, tenant_id: tenantId, deleted_at: null, is_active: true }
  });
  if (!account) throw new AppError('Conta não encontrada ou inativa', 404);
  return account;
}

async function findInvoiceByTenant(tenantId, invoiceId) {
  const invoice = await prisma.creditCardInvoice.findFirst({
    where: { id: invoiceId, tenantId, deletedAt: null },
    include: {
      creditCard: true,
      paymentAccount: true
    }
  });
  if (!invoice) throw new AppError('Fatura não encontrada', 404);
  return invoice;
}

async function getInvoiceTransactions(tenantId, creditCardId, periodStart, periodEnd) {
  return prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      credit_card_id: creditCardId,
      transaction_date: { gte: periodStart, lte: periodEnd },
      status: { in: INVOICE_IMPACTING_STATUSES },
      type: { in: ['EXPENSE', 'INCOME'] },
      source: { not: 'CREDIT_CARD_PAYMENT' },
      deleted_at: null
    },
    include: {
      category: true,
      credit_card: { select: { id: true, name: true, brand: true, color: true } }
    },
    orderBy: { transaction_date: 'desc' }
  });
}

async function listInvoices(tenantId, query = {}) {
  const { creditCardId, year, month, status } = query;
  const now = new Date();
  const defaultYear = year || now.getFullYear();
  const defaultMonth = month || (now.getMonth() + 1);

  const monthStart = new Date(defaultYear, defaultMonth - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(defaultYear, defaultMonth, 0, 23, 59, 59, 999);

  const where = {
    tenantId,
    deletedAt: null,
    periodStart: { lte: monthEnd },
    periodEnd: { gte: monthStart }
  };
  if (creditCardId) where.creditCardId = creditCardId;
  if (status) where.status = status;

  const invoices = await prisma.creditCardInvoice.findMany({
    where,
    include: {
      creditCard: true,
      paymentAccount: true
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
  });

  const enriched = await Promise.all(
    invoices.map(async (inv) => {
      const invoice = await recalculateInvoiceTotal(inv);
      const transactionCount = await countInvoicePurchases(tenantId, invoice.creditCardId, invoice.periodStart, invoice.periodEnd);
      return {
        ...toInvoiceResponse(invoice),
        transactionCount
      };
    })
  );

  return enriched;
}

async function getCurrentInvoices(tenantId) {
  const now = new Date();

  const activeCards = await prisma.creditCard.findMany({
    where: { tenant_id: tenantId, is_active: true, deleted_at: null }
  });

  const results = [];
  for (const card of activeCards) {
    const reference = getInvoiceReferenceForDate(card.closing_day, now);
    const existing = await prisma.creditCardInvoice.findFirst({
      where: {
        tenantId,
        creditCardId: card.id,
        referenceMonth: reference.referenceMonth,
        referenceYear: reference.referenceYear,
        deletedAt: null
      },
      include: { creditCard: true, paymentAccount: true }
    });

    if (existing) {
      const invoice = await recalculateInvoiceTotal(existing);
      const transactionCount = await countInvoicePurchases(tenantId, card.id, invoice.periodStart, invoice.periodEnd);
      results.push({ ...toInvoiceResponse(invoice), transactionCount });
    } else {
      const created = await upsertInvoiceForCardPeriod(
        tenantId,
        card,
        reference.referenceMonth,
        reference.referenceYear
      );
      const createdWithRelations = await prisma.creditCardInvoice.findFirst({
        where: { id: created.id, tenantId, deletedAt: null },
        include: { creditCard: true, paymentAccount: true }
      });

      const transactionCount = await countInvoicePurchases(tenantId, card.id, created.periodStart, created.periodEnd);
      results.push({ ...toInvoiceResponse(createdWithRelations), transactionCount });
    }
  }

  results.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return results;
}

async function getInvoice(tenantId, invoiceId) {
  const invoice = await recalculateInvoiceTotal(await findInvoiceByTenant(tenantId, invoiceId));
  const transactions = await getInvoiceTransactions(tenantId, invoice.creditCardId, invoice.periodStart, invoice.periodEnd);

  const totalAmount = Number(invoice.totalAmount);
  const paidAmount = Number(invoice.paidAmount);
  const remainingAmount = totalAmount - paidAmount;
  const transactionCount = await countInvoicePurchases(tenantId, invoice.creditCardId, invoice.periodStart, invoice.periodEnd);

  return {
    invoice: toInvoiceResponse(invoice),
    transactions: transactions.map((t) => ({
      id: t.id,
      date: formatDateOnly(t.transaction_date),
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      status: t.status,
      category: t.category ? { id: t.category.id, name: t.category.name, color: t.category.color, icon: t.category.icon } : null,
      creditCard: t.credit_card ? { id: t.credit_card.id, name: t.credit_card.name, brand: t.credit_card.brand, color: t.credit_card.color } : null
    })),
    summary: {
      totalAmount,
      transactionCount,
      paidAmount,
      remainingAmount
    }
  };
}

async function generateInvoice(tenantId, { creditCardId, referenceMonth, referenceYear }) {
  const card = await findCreditCardByTenant(tenantId, creditCardId);

  const existing = await prisma.creditCardInvoice.findFirst({
    where: {
      tenantId,
      creditCardId,
      referenceMonth,
      referenceYear,
      deletedAt: null
    }
  });

  if (existing && existing.status === 'PAID') {
    throw new AppError('Fatura paga não pode ser recalculada', 422);
  }

  const generated = await upsertInvoiceForCardPeriod(tenantId, card, referenceMonth, referenceYear);
  const invoice = await prisma.creditCardInvoice.findFirst({
    where: { id: generated.id, tenantId, deletedAt: null },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await countInvoicePurchases(tenantId, creditCardId, invoice.periodStart, invoice.periodEnd);

  return { ...toInvoiceResponse(invoice), transactionCount };
}

async function recalculateInvoice(tenantId, invoiceId) {
  const invoice = await findInvoiceByTenant(tenantId, invoiceId);

  if (invoice.status === 'PAID') {
    throw new AppError('Fatura paga não pode ser recalculada', 422);
  }

  const { buildInvoicePeriod } = require('../../utils/credit-card-invoice');
  const period = buildInvoicePeriod({
    referenceMonth: invoice.referenceMonth,
    referenceYear: invoice.referenceYear,
    closingDay: invoice.creditCard.closing_day,
    dueDay: invoice.creditCard.due_day
  });

  const totalAmount = await calculateInvoiceAmount(tenantId, invoice.creditCardId, period.periodStart, period.periodEnd);

  const updated = await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: {
      totalAmount,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      closingDate: period.closingDate,
      dueDate: period.dueDate
    },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await countInvoicePurchases(tenantId, invoice.creditCardId, updated.periodStart, updated.periodEnd);

  return { ...toInvoiceResponse(updated), transactionCount };
}

async function payInvoice(tenantId, invoiceId, userId, { accountId, paymentDate, amount, notes }) {
  const invoice = await findInvoiceByTenant(tenantId, invoiceId);

  if (invoice.status === 'PAID') {
    throw new AppError('Fatura já está paga', 422);
  }

  await findAccountByTenant(tenantId, accountId);

  const paymentAmount = amount || Number(invoice.totalAmount);
  if (paymentAmount <= 0) {
    throw new AppError('Valor do pagamento deve ser maior que zero', 400);
  }

  if (amount && amount !== Number(invoice.totalAmount)) {
    throw new AppError('Nesta versão o pagamento deve ser do valor total da fatura', 400);
  }

  const creditCardName = invoice.creditCard?.name || 'Cartão';
  const description = `Pagamento da Fatura - ${creditCardName} - ${formatMonthYear(invoice.referenceMonth, invoice.referenceYear)}`;

  const paymentTransaction = await prisma.transaction.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      account_id: accountId,
      credit_card_id: invoice.creditCardId,
      description,
      amount: paymentAmount,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      transaction_date: parseLocalDate(paymentDate),
      payment_method: 'OTHER',
      source: 'CREDIT_CARD_PAYMENT',
      notes: notes || null
    }
  });

  const updated = await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAmount: paymentAmount,
      paidAt: parseLocalDate(paymentDate),
      paymentAccountId: accountId,
      paymentTransactionId: paymentTransaction.id
    },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await countInvoicePurchases(tenantId, invoice.creditCardId, updated.periodStart, updated.periodEnd);

  return { ...toInvoiceResponse(updated), transactionCount };
}

async function cancelInvoicePayment(tenantId, invoiceId) {
  const invoice = await findInvoiceByTenant(tenantId, invoiceId);

  if (invoice.status !== 'PAID') {
    throw new AppError('Fatura não está paga', 422);
  }

  if (invoice.paymentTransactionId) {
    await prisma.transaction.update({
      where: { id: invoice.paymentTransactionId },
      data: { deleted_at: new Date() }
    });
  }

  const updated = await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: {
      status: 'OPEN',
      paidAmount: 0,
      paidAt: null,
      paymentAccountId: null,
      paymentTransactionId: null
    },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await countInvoicePurchases(tenantId, invoice.creditCardId, updated.periodStart, updated.periodEnd);

  return { ...toInvoiceResponse(updated), transactionCount };
}

async function getInvoiceSummary(tenantId) {
  const now = new Date();
  const invoices = await prisma.creditCardInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { not: 'PAID' }
    },
    include: { creditCard: true }
  });

  let totalOpen = 0;
  let nextDue = null;
  let overdueCount = 0;

  for (const inv of invoices) {
    const invoice = await recalculateInvoiceTotal(inv);
    const effectiveStatus = computeEffectiveStatus(invoice);
    const amount = Number(invoice.totalAmount) - Number(invoice.paidAmount);

    if (effectiveStatus !== 'PAID') {
      totalOpen += amount;
    }

    if (effectiveStatus === 'OVERDUE') {
      overdueCount += 1;
    }

    if (effectiveStatus !== 'PAID' && (!nextDue || new Date(invoice.dueDate) < new Date(nextDue))) {
      nextDue = invoice.dueDate;
    }
  }

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const paidThisMonth = await prisma.creditCardInvoice.count({
    where: {
      tenantId,
      deletedAt: null,
      status: 'PAID',
      paidAt: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1)
      }
    }
  });

  return {
    totalOpen,
    nextDue: nextDue || null,
    paidThisMonth,
    overdueCount
  };
}

module.exports = {
  listInvoices,
  getCurrentInvoices,
  getInvoice,
  generateInvoice,
  recalculateInvoice,
  payInvoice,
  cancelInvoicePayment,
  getInvoiceSummary
};
