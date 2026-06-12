const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const planService = require('../plans/plan.service');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function getCurrentMonthRange() {
  const now = new Date();

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  };
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

function buildInvoiceWhere(tenantId, creditCardIds, range) {
  return {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED',
    type: 'EXPENSE',
    transaction_date: {
      gte: range.start,
      lte: range.end
    },
    credit_card_id: Array.isArray(creditCardIds)
      ? { in: creditCardIds }
      : creditCardIds
  };
}

function getInvoiceAmountMap(summaryRows) {
  return summaryRows.reduce((accumulator, item) => {
    accumulator[item.credit_card_id] = toNumber(item._sum.amount);
    return accumulator;
  }, {});
}

function getAvailableLimit(limitAmount, currentInvoiceAmount) {
  return Math.max(limitAmount - currentInvoiceAmount, 0);
}

function toCreditCardResponse(creditCard, summary = {}) {
  const limitAmount = toNumber(creditCard.limit_amount);
  const currentInvoiceAmount = toNumber(summary.currentInvoiceAmount);

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
    availableLimit: getAvailableLimit(limitAmount, currentInvoiceAmount),
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

  const range = getCurrentMonthRange();
  const creditCardIds = creditCards.map((creditCard) => creditCard.id);
  const invoiceSummary = await prisma.transaction.groupBy({
    by: ['credit_card_id'],
    where: buildInvoiceWhere(tenantId, creditCardIds, range),
    _sum: {
      amount: true
    }
  });
  const invoiceAmountMap = getInvoiceAmountMap(invoiceSummary);

  return creditCards.map((creditCard) => toCreditCardResponse(creditCard, {
    currentInvoiceAmount: invoiceAmountMap[creditCard.id] || 0
  }));
}

async function getCreditCardById(creditCardId, tenantId) {
  const creditCard = await findCreditCardByTenant(creditCardId, tenantId);

  if (!creditCard) {
    throw new AppError('Cartao nao encontrado', 404);
  }

  const range = getCurrentMonthRange();
  const [invoiceSummary, expenseCountCurrentMonth] = await Promise.all([
    prisma.transaction.aggregate({
      where: buildInvoiceWhere(tenantId, creditCard.id, range),
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.count({
      where: buildInvoiceWhere(tenantId, creditCard.id, range)
    })
  ]);

  return toCreditCardResponse(creditCard, {
    currentInvoiceAmount: toNumber(invoiceSummary._sum.amount),
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

  const range = getCurrentMonthRange();
  const invoiceSummary = await prisma.transaction.aggregate({
    where: buildInvoiceWhere(tenantId, creditCard.id, range),
    _sum: {
      amount: true
    }
  });

  return toCreditCardResponse(creditCard, {
    currentInvoiceAmount: toNumber(invoiceSummary._sum.amount)
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
