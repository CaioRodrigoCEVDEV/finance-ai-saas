const prisma = require('../config/prisma');
const AppError = require('./app-error');

const INVOICE_IMPACTING_STATUSES = ['CONFIRMED', 'PENDING'];

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function safeDay(day, year, month) {
  return Math.min(day, lastDayOfMonth(year, month));
}

function buildInvoicePeriod({ referenceMonth, referenceYear, closingDay, dueDay }) {
  const closingDaySafe = safeDay(closingDay, referenceYear, referenceMonth);
  const closingDate = new Date(referenceYear, referenceMonth - 1, closingDaySafe, 12, 0, 0);

  let dueYear = closingDate.getFullYear();
  let dueMonth = closingDate.getMonth();
  if (dueDay <= closingDay) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }

  const dueDaySafe = safeDay(dueDay, dueYear, dueMonth + 1);
  const dueDate = new Date(dueYear, dueMonth, dueDaySafe, 12, 0, 0);

  let prevClosingYear = closingDate.getFullYear();
  let prevClosingMonth = closingDate.getMonth() - 1;
  if (prevClosingMonth < 0) {
    prevClosingMonth = 11;
    prevClosingYear -= 1;
  }

  const prevClosingDaySafe = safeDay(closingDay, prevClosingYear, prevClosingMonth + 1);
  const prevClosingDate = new Date(prevClosingYear, prevClosingMonth, prevClosingDaySafe, 12, 0, 0);
  const periodStart = new Date(prevClosingDate);
  periodStart.setDate(periodStart.getDate() + 1);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(closingDate);
  periodEnd.setHours(23, 59, 59, 999);

  return {
    periodStart,
    periodEnd,
    closingDate,
    dueDate
  };
}

function calculateCreditCardBillingPeriod(closingDay, referenceDate) {
  const reference = getInvoiceReferenceForDate(closingDay, referenceDate);
  const period = buildInvoicePeriod({
    referenceMonth: reference.referenceMonth,
    referenceYear: reference.referenceYear,
    closingDay,
    dueDay: closingDay
  });
  return {
    startDate: period.periodStart,
    endDate: period.periodEnd
  };
}

function getInvoiceReferenceForDate(closingDay, referenceDate) {
  const date = new Date(referenceDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const closingInMonth = safeDay(closingDay, year, month);

  if (day <= closingInMonth) {
    return { referenceMonth: month, referenceYear: year };
  }

  if (month === 12) {
    return { referenceMonth: 1, referenceYear: year + 1 };
  }

  return { referenceMonth: month + 1, referenceYear: year };
}

function calculateTransactionsNetAmount(transactions) {
  return transactions.reduce((sum, transaction) => {
    const amount = Number(transaction.amount || 0);
    if (transaction.type === 'INCOME') {
      return sum - amount;
    }
    if (transaction.type === 'EXPENSE') {
      return sum + amount;
    }
    return sum;
  }, 0);
}

function buildInvoiceTransactionWhere(tenantId, creditCardId, periodStart, periodEnd) {
  return {
    tenant_id: tenantId,
    credit_card_id: creditCardId,
    transaction_date: { gte: periodStart, lte: periodEnd },
    status: { in: INVOICE_IMPACTING_STATUSES },
    type: { in: ['EXPENSE', 'INCOME'] },
    source: { not: 'CREDIT_CARD_PAYMENT' },
    deleted_at: null
  };
}

async function calculateInvoiceAmount(tenantId, creditCardId, periodStart, periodEnd, database = prisma) {
  const transactions = await database.transaction.findMany({
    where: buildInvoiceTransactionWhere(tenantId, creditCardId, periodStart, periodEnd),
    select: { amount: true, type: true }
  });

  return calculateTransactionsNetAmount(transactions);
}

async function countInvoicePurchases(tenantId, creditCardId, periodStart, periodEnd) {
  return prisma.transaction.count({
    where: {
      tenant_id: tenantId,
      credit_card_id: creditCardId,
      transaction_date: { gte: periodStart, lte: periodEnd },
      status: { in: INVOICE_IMPACTING_STATUSES },
      type: 'EXPENSE',
      source: { not: 'CREDIT_CARD_PAYMENT' },
      deleted_at: null
    }
  });
}

async function recalculateInvoiceTotal(invoice) {
  if (!invoice || invoice.status === 'PAID') {
    return invoice;
  }

  const totalAmount = await calculateInvoiceAmount(
    invoice.tenantId,
    invoice.creditCardId,
    invoice.periodStart,
    invoice.periodEnd
  );

  if (Number(invoice.totalAmount) === Number(totalAmount)) {
    return invoice;
  }

  await prisma.creditCardInvoice.update({
    where: { id: invoice.id },
    data: { totalAmount }
  });

  return { ...invoice, totalAmount };
}

async function upsertInvoiceForCardPeriod(tenantId, card, referenceMonth, referenceYear, database = prisma, options = {}) {
  const period = buildInvoicePeriod({
    referenceMonth,
    referenceYear,
    closingDay: card.closing_day,
    dueDay: card.due_day
  });

  const existing = await database.creditCardInvoice.findFirst({
    where: {
      tenantId,
      creditCardId: card.id,
      referenceMonth,
      referenceYear,
      deletedAt: null
    }
  });

  if (existing && existing.status === 'PAID') {
    if (options.rejectPaidInvoices) {
      throw new AppError('Nao e possivel criar ou alterar parcelas vinculadas a uma fatura paga', 422);
    }

    return existing;
  }

  const totalAmount = await calculateInvoiceAmount(tenantId, card.id, period.periodStart, period.periodEnd, database);

  if (existing) {
    return database.creditCardInvoice.update({
      where: { id: existing.id },
      data: {
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        closingDate: period.closingDate,
        dueDate: period.dueDate,
        totalAmount
      }
    });
  }

  return database.creditCardInvoice.create({
    data: {
      tenantId,
      creditCardId: card.id,
      referenceMonth,
      referenceYear,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      closingDate: period.closingDate,
      dueDate: period.dueDate,
      totalAmount,
      status: 'OPEN'
    }
  });
}

async function ensureInvoiceForTransaction(tenantId, creditCardId, transactionDate, database = prisma, options = {}) {
  if (!creditCardId || !transactionDate) {
    return null;
  }

  const card = await database.creditCard.findFirst({
    where: { id: creditCardId, tenant_id: tenantId, deleted_at: null }
  });

  if (!card) {
    return null;
  }

  const reference = getInvoiceReferenceForDate(card.closing_day, transactionDate);
  return upsertInvoiceForCardPeriod(tenantId, card, reference.referenceMonth, reference.referenceYear, database, options);
}

async function syncTransactionInvoiceChanges(tenantId, beforeTransaction, afterTransaction, database = prisma, options = {}) {
  const targets = new Map();

  [beforeTransaction, afterTransaction].flat().filter(Boolean).forEach((transaction) => {
    if (!transaction?.credit_card_id || !transaction?.transaction_date) {
      return;
    }

    targets.set(
      `${transaction.credit_card_id}:${new Date(transaction.transaction_date).getTime()}`,
      {
        creditCardId: transaction.credit_card_id,
        transactionDate: transaction.transaction_date
      }
    );
  });

  for (const target of targets.values()) {
    await ensureInvoiceForTransaction(tenantId, target.creditCardId, target.transactionDate, database, options);
  }
}

async function calculateInvoiceAmountForCards(prisma, tenantId, cardIds, { cardRanges, range } = {}) {
  const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
  if (ids.length === 0) return new Map();

  const results = await Promise.all(
    ids.map(async (cardId) => {
      const cardRange = cardRanges?.get(cardId) || range;
      if (!cardRange) return new Map();

      const transactions = await prisma.transaction.findMany({
        where: {
          tenant_id: tenantId,
          credit_card_id: cardId,
          transaction_date: { gte: cardRange.start, lte: cardRange.end },
          status: { in: INVOICE_IMPACTING_STATUSES },
          type: { in: ['EXPENSE', 'INCOME'] },
          source: { not: 'CREDIT_CARD_PAYMENT' },
          deleted_at: null
        },
        select: { amount: true, type: true }
      });

      const netAmount = calculateTransactionsNetAmount(transactions);
      return new Map([[cardId, netAmount]]);
    })
  );

  return results.reduce((acc, cardMap) => {
    cardMap.forEach((amount, cardId) => {
      acc.set(cardId, (acc.get(cardId) || 0) + amount);
    });
    return acc;
  }, new Map());
}

module.exports = {
  INVOICE_IMPACTING_STATUSES,
  buildInvoicePeriod,
  buildInvoiceTransactionWhere,
  calculateCreditCardBillingPeriod,
  calculateInvoiceAmount,
  calculateInvoiceAmountForCards,
  calculateTransactionsNetAmount,
  countInvoicePurchases,
  ensureInvoiceForTransaction,
  getInvoiceReferenceForDate,
  lastDayOfMonth,
  recalculateInvoiceTotal,
  safeDay,
  syncTransactionInvoiceChanges,
  upsertInvoiceForCardPeriod
};
