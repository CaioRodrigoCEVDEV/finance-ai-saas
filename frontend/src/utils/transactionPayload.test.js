import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTransactionPayload, getInstallmentAmount } from './transactionPayload.js';

const formValues = {
  description: ' mercado livre ',
  amount: '200.72',
  type: 'EXPENSE',
  status: 'CONFIRMED',
  transactionDate: '2026-07-24',
  paymentMethod: 'CREDIT_CARD',
  accountId: '',
  creditCardId: '33333333-3333-4333-8333-333333333333',
  categoryId: '',
  notes: '',
  isInstallment: true,
  installmentTotal: '2'
};

test('envia a quantidade total sem enviar numero de parcela', () => {
  const payload = buildTransactionPayload(formValues);

  assert.equal(payload.isInstallment, true);
  assert.equal(payload.installmentTotal, 2);
  assert.equal('installmentNumber' in payload, false);
  assert.equal(payload.amount, 200.72);
});

test('remove dados antigos quando o parcelamento esta desmarcado', () => {
  const payload = buildTransactionPayload({ ...formValues, isInstallment: false });

  assert.equal(payload.isInstallment, false);
  assert.equal('installmentTotal' in payload, false);
});

test('calcula o resumo com distribuicao deterministica de centavos', () => {
  assert.equal(getInstallmentAmount(200.72, 2), 100.36);
  assert.equal(getInstallmentAmount(100, 3), 33.34);
});
