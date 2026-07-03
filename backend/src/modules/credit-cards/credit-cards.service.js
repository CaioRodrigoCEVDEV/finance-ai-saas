const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const {
  buildCreditCardExpenseWhere,
  getCreditCardExpenseAmountMap
} = require('../../utils/credit-card-limit');
const { calculateCreditCardBillingPeriod } = require('../../utils/credit-card-billing');
const planService = require('../plans/plan.service');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function buildCardRanges(creditCards) {
  const now = new Date();
  const ranges = new Map();

  creditCards.forEach((card) => {
    const period = calculateCreditCardBillingPeriod(card.closing_day, now);
    ranges.set(card.id, { start: period.startDate, end: period.endDate });
  });

  return ranges;
}

async function findAccountByTenant(accountId, tenantId) {
  if (!accountId) {
    return null;
  }

  return prisma.account.findFirst({
    where: {
      id: accountId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function findCreditCardByTenant(creditCardId, tenantId) {
  return prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

function getAvailableLimit(limitAmount, usedAmount) {
  return Math.max(limitAmount - usedAmount, 0);
}

function toCreditCardResponse(creditCard, summary = {}) {
  const limitAmount = toNumber(creditCard.limit_amount);
  const currentInvoiceAmount = toNumber(summary.currentInvoiceAmount);
  const usedAmount = toNumber(summary.usedAmount);
  const usagePercentage = limitAmount > 0 ? Number(((usedAmount / limitAmount) * 100).toFixed(2)) : 0;

  return {
    id: creditCard.id,
    name: creditCard.name,
    brand: creditCard.brand,
    limitAmount,
    closingDay: creditCard.closing_day,
    dueDay: creditCard.due_day,
    color: creditCard.color,
    isActive: creditCard.is_active,
    account: creditCard.account ? {
      id: creditCard.account.id,
      name: creditCard.account.name
    } : null,
    currentInvoiceAmount,
    usedAmount,
    availableLimit: getAvailableLimit(limitAmount, usedAmount),
    usagePercentage,
    expenseCountCurrentMonth: summary.expenseCountCurrentMonth ?? 0,
    createdAt: creditCard.created_at.toISOString(),
    updatedAt: creditCard.updated_at.toISOString()
  };
}

async function validateAccount(accountId, tenantId) {
  const normalizedAccountId = accountId === undefined ? undefined : (accountId || null);

  if (!normalizedAccountId) {
    return null;
  }

  const account = await findAccountByTenant(normalizedAccountId, tenantId);

  if (!account) {
    throw new AppError('Conta nao encontrada para o tenant atual', 404);
  }

  return account;
}

async function listCreditCards(tenantId) {
  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    },
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  if (creditCards.length === 0) {
    return [];
  }

  const cardRanges = buildCardRanges(creditCards);
  const creditCardIds = creditCards.map((creditCard) => creditCard.id);
  const [invoiceAmountMap, usedAmountMap] = await Promise.all([
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, { cardRanges }),
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, { cardRanges, excludePaidInvoices: true })
  ]);

  return creditCards.map((creditCard) => toCreditCardResponse(creditCard, {
    currentInvoiceAmount: invoiceAmountMap.get(creditCard.id) || 0,
    usedAmount: usedAmountMap.get(creditCard.id) || 0
  }));
}

async function getCreditCardById(creditCardId, tenantId) {
  const creditCard = await findCreditCardByTenant(creditCardId, tenantId);

  if (!creditCard) {
    throw new AppError('Cartao nao encontrado', 404);
  }

  const cardPeriod = calculateCreditCardBillingPeriod(creditCard.closing_day, new Date());
  const cardRange = { start: cardPeriod.startDate, end: cardPeriod.endDate };
  const [invoiceAmountMap, usedAmountMap, expenseCountCurrentMonth] = await Promise.all([
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, { range: cardRange }),
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, { range: cardRange, excludePaidInvoices: true }),
    prisma.transaction.count({
      where: buildCreditCardExpenseWhere(tenantId, creditCard.id, range)
    })
  ]);

  return toCreditCardResponse(creditCard, {
    currentInvoiceAmount: invoiceAmountMap.get(creditCard.id) || 0,
    usedAmount: usedAmountMap.get(creditCard.id) || 0,
    expenseCountCurrentMonth
  });
}

async function createCreditCard(data, tenantId, userId) {
  await planService.assertCanCreateCreditCard(tenantId);
  await validateAccount(data.accountId, tenantId);

  const creditCard = await prisma.creditCard.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      account_id: data.accountId || null,
      name: data.name,
      brand: data.brand ?? null,
      limit_amount: toDecimalString(data.limitAmount),
      closing_day: data.closingDay,
      due_day: data.dueDay,
      color: data.color ?? null,
      is_active: data.isActive ?? true
    },
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return toCreditCardResponse(creditCard);
}

async function updateCreditCard(creditCardId, tenantId, data) {
  const existingCreditCard = await findCreditCardByTenant(creditCardId, tenantId);

  if (!existingCreditCard) {
    throw new AppError('Cartao nao encontrado', 404);
  }

  await validateAccount(data.accountId, tenantId);

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.brand !== undefined) {
    updateData.brand = data.brand;
  }

  if (data.limitAmount !== undefined) {
    updateData.limit_amount = toDecimalString(data.limitAmount);
  }

  if (data.closingDay !== undefined) {
    updateData.closing_day = data.closingDay;
  }

  if (data.dueDay !== undefined) {
    updateData.due_day = data.dueDay;
  }

  if (data.accountId !== undefined) {
    updateData.account_id = data.accountId || null;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.isActive !== undefined) {
    updateData.is_active = data.isActive;
  }

  const creditCard = await prisma.creditCard.update({
    where: {
      id: existingCreditCard.id
    },
    data: updateData,
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const updatedPeriod = calculateCreditCardBillingPeriod(creditCard.closing_day, new Date());
  const updatedRange = { start: updatedPeriod.startDate, end: updatedPeriod.endDate };
  const [invoiceAmountMap, usedAmountMap] = await Promise.all([
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, { range: updatedRange }),
    getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, { range: updatedRange, excludePaidInvoices: true })
  ]);

  return toCreditCardResponse(creditCard, {
    currentInvoiceAmount: invoiceAmountMap.get(creditCard.id) || 0,
    usedAmount: usedAmountMap.get(creditCard.id) || 0
  });
}

async function deleteCreditCard(creditCardId, tenantId) {
  const existingCreditCard = await findCreditCardByTenant(creditCardId, tenantId);

  if (!existingCreditCard) {
    throw new AppError('Cartao nao encontrado', 404);
  }

  const linkedTransactions = await prisma.transaction.count({
    where: {
      tenant_id: tenantId,
      credit_card_id: existingCreditCard.id,
      deleted_at: null
    }
  });

  if (linkedTransactions > 0) {
    throw new AppError('Cartao possui transacoes vinculadas e nao pode ser excluido.', 400);
  }

  await prisma.creditCard.update({
    where: {
      id: existingCreditCard.id
    },
    data: {
      deleted_at: new Date(),
      is_active: false
    }
  });

  return {
    message: 'Cartao excluido com sucesso'
  };
}

module.exports = {
  listCreditCards,
  getCreditCardById,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard
};
