import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { getCreditCardSummary, getCreditCardUsagePercentage } from './creditCardMetrics.js';

test('soma o limite disponivel dos cartoes ativos com precisao de centavos', () => {
  const summary = getCreditCardSummary([
    { limitAmount: 1066, availableLimit: 865.28, isActive: true },
    { limitAmount: 500, availableLimit: 399.99, isActive: true }
  ]);

  assert.deepEqual(summary, {
    limitAmount: 1566,
    availableLimit: 1265.27,
    activeCards: 2
  });
});

test('usa o saldo total comprometido no percentual de uso do limite', () => {
  assert.equal(getCreditCardUsagePercentage({
    limitAmount: 1066,
    usedAmount: 200.72
  }).toFixed(2), '18.83');

  assert.equal(getCreditCardUsagePercentage({
    limitAmount: 1066,
    usedAmount: 100,
    usagePercentage: 18.83
  }), 18.83);
});

test('remove as informacoes mensais e mantem os grids responsivos', () => {
  const cardSource = readFileSync(
    new URL('../components/creditCards/CreditCardCard.jsx', import.meta.url),
    'utf8'
  );
  const summarySource = readFileSync(
    new URL('../components/creditCards/CreditCardSummary.jsx', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(cardSource, /Usado no m[eê]s/i);
  assert.doesNotMatch(summarySource, /Total utilizado no m[eê]s/i);
  assert.match(cardSource, /sm:grid-cols-2/);
  assert.match(summarySource, /md:grid-cols-3/);
});
