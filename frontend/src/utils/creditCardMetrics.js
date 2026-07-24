function toCents(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100);
}

export function getCreditCardSummary(cards) {
  const totals = cards.reduce((accumulator, card) => ({
    limitAmount: accumulator.limitAmount + toCents(card.limitAmount),
    availableLimit: accumulator.availableLimit + toCents(card.availableLimit),
    activeCards: accumulator.activeCards + (card.isActive ? 1 : 0)
  }), {
    limitAmount: 0,
    availableLimit: 0,
    activeCards: 0
  });

  return {
    limitAmount: totals.limitAmount / 100,
    availableLimit: totals.availableLimit / 100,
    activeCards: totals.activeCards
  };
}

export function getCreditCardUsagePercentage(creditCard) {
  const usagePercentage = Number(creditCard.usagePercentage);

  if (Number.isFinite(usagePercentage)) {
    return usagePercentage;
  }

  const limitAmount = Number(creditCard.limitAmount || 0);
  const usedAmount = Math.max(Number(creditCard.usedAmount || 0), 0);

  return limitAmount > 0 ? (usedAmount / limitAmount) * 100 : 0;
}
