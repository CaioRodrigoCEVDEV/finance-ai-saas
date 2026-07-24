const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { getCreditCardExpenseAmountMap } = require('../../utils/credit-card-limit');
const planService = require('../plans/plan.service');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
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
  const limitInCents = Math.round((limitAmount + Number.EPSILON) * 100);
  const usedInCents = Math.max(Math.round((usedAmount + Number.EPSILON) * 100), 0);

  return Math.min(Math.max(limitInCents - usedInCents, 0), limitInCents) / 100;
}

function toCreditCardResponse(creditCard, summary = {}) {
  const limitAmount = toNumber(creditCard.limit_amount);
  const usedAmount = Math.max(toNumber(summary.usedAmount), 0);
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
    usedAmount,
    availableLimit: getAvailableLimit(limitAmount, usedAmount),
    usagePercentage,
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

  const creditCardIds = creditCards.map((creditCard) => creditCard.id);
  const usedAmountMap = await getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, {
    excludePaidInvoices: true
  });

  return creditCards.map((creditCard) => toCreditCardResponse(creditCard, {
    usedAmount: usedAmountMap.get(creditCard.id) || 0
  }));
}

async function getCreditCardById(creditCardId, tenantId) {
  const creditCard = await findCreditCardByTenant(creditCardId, tenantId);

  if (!creditCard) {
    throw new AppError('Cartao nao encontrado', 404);
  }

  const usedAmountMap = await getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, {
    excludePaidInvoices: true
  });

  return toCreditCardResponse(creditCard, {
    usedAmount: usedAmountMap.get(creditCard.id) || 0
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

  const usedAmountMap = await getCreditCardExpenseAmountMap(prisma, tenantId, creditCard.id, {
    excludePaidInvoices: true
  });

  return toCreditCardResponse(creditCard, {
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
