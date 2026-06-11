const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { buildInvoicePeriod, computeEffectiveStatus, formatMonthYear } = require('./invoices.helper');

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
    paidAt: invoice.paidAt,
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

async function calculateInvoiceTotal(creditCardId, periodStart, periodEnd) {
  const transactions = await prisma.transaction.findMany({
    where: {
      credit_card_id: creditCardId,
      transaction_date: { gte: periodStart, lte: periodEnd },
      type: 'EXPENSE',
      deleted_at: null
    }
  });
  return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
}

async function getInvoiceTransactions(creditCardId, periodStart, periodEnd) {
  return prisma.transaction.findMany({
    where: {
      credit_card_id: creditCardId,
      transaction_date: { gte: periodStart, lte: periodEnd },
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

  const where = {
    tenantId,
    deletedAt: null,
    referenceYear: defaultYear,
    referenceMonth: defaultMonth
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
      const transactionCount = await prisma.transaction.count({
        where: {
          credit_card_id: inv.creditCardId,
          transaction_date: { gte: inv.periodStart, lte: inv.periodEnd },
          deleted_at: null
        }
      });
      return {
        ...toInvoiceResponse(inv),
        transactionCount
      };
    })
  );

  return enriched;
}

async function getCurrentInvoices(tenantId) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const activeCards = await prisma.creditCard.findMany({
    where: { tenant_id: tenantId, is_active: true, deleted_at: null }
  });

  const results = [];
  for (const card of activeCards) {
    const existing = await prisma.creditCardInvoice.findFirst({
      where: {
        tenantId,
        creditCardId: card.id,
        referenceMonth: currentMonth,
        referenceYear: currentYear,
        deletedAt: null
      },
      include: { creditCard: true, paymentAccount: true }
    });

    if (existing) {
      const transactionCount = await prisma.transaction.count({
        where: {
          credit_card_id: card.id,
          transaction_date: { gte: existing.periodStart, lte: existing.periodEnd },
          deleted_at: null
        }
      });
      results.push({ ...toInvoiceResponse(existing), transactionCount });
    } else {
      const period = buildInvoicePeriod({
        referenceMonth: currentMonth,
        referenceYear: currentYear,
        closingDay: card.closing_day,
        dueDay: card.due_day
      });
      const totalAmount = await calculateInvoiceTotal(card.id, period.periodStart, period.periodEnd);

      const created = await prisma.creditCardInvoice.create({
        data: {
          tenantId,
          creditCardId: card.id,
          referenceMonth: currentMonth,
          referenceYear: currentYear,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          closingDate: period.closingDate,
          dueDate: period.dueDate,
          totalAmount,
          status: 'OPEN'
        },
        include: { creditCard: true, paymentAccount: true }
      });

      const transactionCount = await prisma.transaction.count({
        where: {
          credit_card_id: card.id,
          transaction_date: { gte: created.periodStart, lte: created.periodEnd },
          deleted_at: null
        }
      });
      results.push({ ...toInvoiceResponse(created), transactionCount });
    }
  }

  results.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return results;
}

async function getInvoice(tenantId, invoiceId) {
  const invoice = await findInvoiceByTenant(tenantId, invoiceId);
  const transactions = await getInvoiceTransactions(invoice.creditCardId, invoice.periodStart, invoice.periodEnd);

  const totalAmount = Number(invoice.totalAmount);
  const paidAmount = Number(invoice.paidAmount);
  const remainingAmount = totalAmount - paidAmount;

  return {
    invoice: toInvoiceResponse(invoice),
    transactions: transactions.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      status: t.status,
      category: t.category ? { id: t.category.id, name: t.category.name, color: t.category.color, icon: t.category.icon } : null,
      creditCard: t.credit_card ? { id: t.credit_card.id, name: t.credit_card.name, brand: t.credit_card.brand, color: t.credit_card.color } : null
    })),
    summary: {
      totalAmount,
      transactionCount: transactions.length,
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

  const period = buildInvoicePeriod({
    referenceMonth,
    referenceYear,
    closingDay: card.closing_day,
    dueDay: card.due_day
  });
  const totalAmount = await calculateInvoiceTotal(creditCardId, period.periodStart, period.periodEnd);

  const invoice = await prisma.creditCardInvoice.upsert({
    where: existing ? { id: existing.id } : { id: '' },
    create: {
      tenantId,
      creditCardId,
      referenceMonth,
      referenceYear,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      closingDate: period.closingDate,
      dueDate: period.dueDate,
      totalAmount,
      status: 'OPEN'
    },
    update: {
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      closingDate: period.closingDate,
      dueDate: period.dueDate,
      totalAmount
    },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await prisma.transaction.count({
    where: {
      credit_card_id: creditCardId,
      transaction_date: { gte: period.periodStart, lte: period.periodEnd },
      deleted_at: null
    }
  });

  return { ...toInvoiceResponse(invoice), transactionCount };
}

async function recalculateInvoice(tenantId, invoiceId) {
  const invoice = await findInvoiceByTenant(tenantId, invoiceId);

  if (invoice.status === 'PAID') {
    throw new AppError('Fatura paga não pode ser recalculada', 422);
  }

  const totalAmount = await calculateInvoiceTotal(invoice.creditCardId, invoice.periodStart, invoice.periodEnd);

  const updated = await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: { totalAmount },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await prisma.transaction.count({
    where: {
      credit_card_id: invoice.creditCardId,
      transaction_date: { gte: updated.periodStart, lte: updated.periodEnd },
      deleted_at: null
    }
  });

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
  const description = `Pagamento fatura ${creditCardName} - ${formatMonthYear(invoice.referenceMonth, invoice.referenceYear)}`;

  const paymentTransaction = await prisma.transaction.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      account_id: accountId,
      description,
      amount: paymentAmount,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      transaction_date: new Date(paymentDate),
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
      paidAt: new Date(paymentDate),
      paymentAccountId: accountId,
      paymentTransactionId: paymentTransaction.id
    },
    include: { creditCard: true, paymentAccount: true }
  });

  const transactionCount = await prisma.transaction.count({
    where: {
      credit_card_id: invoice.creditCardId,
      transaction_date: { gte: updated.periodStart, lte: updated.periodEnd },
      deleted_at: null
    }
  });

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

  const transactionCount = await prisma.transaction.count({
    where: {
      credit_card_id: invoice.creditCardId,
      transaction_date: { gte: updated.periodStart, lte: updated.periodEnd },
      deleted_at: null
    }
  });

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
    const effectiveStatus = computeEffectiveStatus(inv);
    const amount = Number(inv.totalAmount) - Number(inv.paidAmount);

    if (effectiveStatus !== 'PAID') {
      totalOpen += amount;
    }

    if (effectiveStatus === 'OVERDUE') {
      overdueCount += 1;
    }

    if (effectiveStatus !== 'PAID' && (!nextDue || new Date(inv.dueDate) < new Date(nextDue))) {
      nextDue = inv.dueDate;
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
