const { INVOICE_IMPACTING_STATUSES } = require('./credit-card-invoice');

const LIMIT_IMPACTING_STATUSES = INVOICE_IMPACTING_STATUSES;

function toCents(value) {
  const normalizedValue = String(value || 0);
  const match = normalizedValue.match(/^(-?)(\d+)(?:\.(\d+))?$/);

  if (!match) {
    return BigInt(Math.round((Number(value || 0) + Number.EPSILON) * 100));
  }

  const sign = match[1] === '-' ? -1n : 1n;
  const whole = BigInt(match[2]);
  const fraction = BigInt((match[3] || '').padEnd(2, '0').slice(0, 2));

  return sign * ((whole * 100n) + fraction);
}

function centsToNumber(value) {
  const maximumSafeCents = BigInt(Number.MAX_SAFE_INTEGER);
  const safeValue = value > maximumSafeCents
    ? maximumSafeCents
    : value < -maximumSafeCents
      ? -maximumSafeCents
      : value;

  return Number(safeValue) / 100;
}

function normalizeCreditCardIds(creditCardIds) {
  return Array.isArray(creditCardIds) ? creditCardIds : [creditCardIds];
}

function buildCreditCardNetWhere(tenantId, creditCardIds, range) {
  const ids = normalizeCreditCardIds(creditCardIds);
  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    status: {
      in: LIMIT_IMPACTING_STATUSES
    },
    type: { in: ['EXPENSE', 'INCOME'] },
    credit_card_id: ids.length === 1 ? ids[0] : { in: ids },
    source: { not: 'CREDIT_CARD_PAYMENT' }
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
    && (!invoice.paidAt || !transaction.created_at || transaction.created_at <= invoice.paidAt)
  ));
}

async function queryCardExpenses(prisma, tenantId, ids, range, excludePaidInvoices) {
  ids = normalizeCreditCardIds(ids);

  const [transactions, paidInvoices] = await Promise.all([
    prisma.transaction.findMany({
      where: buildCreditCardNetWhere(tenantId, ids, range),
      select: {
        credit_card_id: true,
        amount: true,
        type: true,
        transaction_date: true,
        created_at: true
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
          periodEnd: true,
          paidAt: true
        }
      })
      : Promise.resolve([])
  ]);

  const paidInvoicesByCard = groupPaidInvoicesByCard(paidInvoices);

  const amountsInCents = transactions.reduce((accumulator, transaction) => {
    if (excludePaidInvoices && isTransactionInPaidInvoice(transaction, paidInvoicesByCard)) {
      return accumulator;
    }

    const amountInCents = toCents(transaction.amount);
    const netAmountInCents = transaction.type === 'INCOME' ? -amountInCents : amountInCents;

    accumulator.set(
      transaction.credit_card_id,
      (accumulator.get(transaction.credit_card_id) || 0n) + netAmountInCents
    );

    return accumulator;
  }, new Map());

  return new Map(Array.from(amountsInCents, ([creditCardId, amountInCents]) => (
    [creditCardId, centsToNumber(amountInCents)]
  )));
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
  buildCreditCardNetWhere,
  getCreditCardExpenseAmountMap
};
