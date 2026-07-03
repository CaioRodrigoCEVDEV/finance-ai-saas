const LIMIT_IMPACTING_STATUSES = ['CONFIRMED', 'PENDING'];

function toNumber(value) {
  return Number(value || 0);
}

function normalizeCreditCardIds(creditCardIds) {
  return Array.isArray(creditCardIds) ? creditCardIds : [creditCardIds];
}

function buildCreditCardExpenseWhere(tenantId, creditCardIds, range) {
  const ids = normalizeCreditCardIds(creditCardIds);
  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    status: {
      in: LIMIT_IMPACTING_STATUSES
    },
    type: 'EXPENSE',
    credit_card_id: ids.length === 1 ? ids[0] : { in: ids }
  };

  if (range) {
    where.transaction_date = {
      gte: range.start,
      lte: range.end
    };
  }

  return where;
}

function groupPaidInvoicesByCard(paidInvoices) {
  return paidInvoices.reduce((accumulator, invoice) => {
    if (!accumulator.has(invoice.creditCardId)) {
      accumulator.set(invoice.creditCardId, []);
    }

    accumulator.get(invoice.creditCardId).push(invoice);

    return accumulator;
  }, new Map());
}

function isTransactionInPaidInvoice(transaction, paidInvoicesByCard) {
  const paidInvoices = paidInvoicesByCard.get(transaction.credit_card_id) || [];
  const transactionDate = transaction.transaction_date.getTime();

  return paidInvoices.some((invoice) => (
    transactionDate >= invoice.periodStart.getTime()
    && transactionDate <= invoice.periodEnd.getTime()
  ));
}

async function queryCardExpenses(prisma, tenantId, ids, range, excludePaidInvoices) {
  ids = normalizeCreditCardIds(ids);

  const [transactions, paidInvoices] = await Promise.all([
    prisma.transaction.findMany({
      where: buildCreditCardExpenseWhere(tenantId, ids, range),
      select: {
        credit_card_id: true,
        amount: true,
        transaction_date: true
      }
    }),
    excludePaidInvoices
      ? prisma.creditCardInvoice.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: 'PAID',
          creditCardId: ids.length === 1 ? ids[0] : { in: ids }
        },
        select: {
          creditCardId: true,
          periodStart: true,
          periodEnd: true
        }
      })
      : Promise.resolve([])
  ]);

  const paidInvoicesByCard = groupPaidInvoicesByCard(paidInvoices);

  return transactions.reduce((accumulator, transaction) => {
    if (excludePaidInvoices && isTransactionInPaidInvoice(transaction, paidInvoicesByCard)) {
      return accumulator;
    }

    accumulator.set(
      transaction.credit_card_id,
      (accumulator.get(transaction.credit_card_id) || 0) + Math.abs(toNumber(transaction.amount))
    );

    return accumulator;
  }, new Map());
}

async function getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, { range, excludePaidInvoices = false, cardRanges } = {}) {
  const ids = normalizeCreditCardIds(creditCardIds);

  if (ids.length === 0) {
    return new Map();
  }

  if (cardRanges && cardRanges.size > 0) {
    const results = await Promise.all(
      ids.map((id) => {
        const cardRange = cardRanges.get(id);
        return queryCardExpenses(prisma, tenantId, id, cardRange, excludePaidInvoices);
      })
    );

    return results.reduce((accumulator, cardMap) => {
      cardMap.forEach((amount, cardId) => {
        accumulator.set(cardId, (accumulator.get(cardId) || 0) + amount);
      });
      return accumulator;
    }, new Map());
  }

  return queryCardExpenses(prisma, tenantId, ids, range, excludePaidInvoices);
}

module.exports = {
  buildCreditCardExpenseWhere,
  getCreditCardExpenseAmountMap
};
