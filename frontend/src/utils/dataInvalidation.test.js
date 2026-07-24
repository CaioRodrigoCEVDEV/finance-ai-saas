import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DATA_MUTATIONS,
  createInvalidationRunner,
  getMutationDomains,
  publishDataMutation,
  subscribeToDataDomains
} from './dataInvalidation.js';

test('mapeia cada mutacao para os dominios afetados', () => {
  assert.deepEqual(getMutationDomains(DATA_MUTATIONS.TRANSACTION_CREATED), [
    'dashboard',
    'transactions',
    'accounts',
    'creditCards',
    'invoices',
    'budgets',
    'calendar',
    'reports'
  ]);
  assert.deepEqual(getMutationDomains(DATA_MUTATIONS.TRANSFER_CREATED), [
    'dashboard',
    'transactions',
    'accounts',
    'calendar',
    'reports'
  ]);
  assert.deepEqual(getMutationDomains(DATA_MUTATIONS.RECURRENCE_CREATED), ['recurrences', 'calendar']);
  assert.deepEqual(getMutationDomains(DATA_MUTATIONS.GOAL_CREATED), ['goals', 'dashboard']);
  assert.deepEqual(getMutationDomains(DATA_MUTATIONS.IMPORT_CONFIRMED), [
    'dashboard',
    'transactions',
    'accounts',
    'creditCards',
    'invoices',
    'budgets',
    'calendar',
    'reports'
  ]);
});

test('notifica somente assinantes de dominios relacionados uma vez', () => {
  let dashboardCalls = 0;
  let recurrenceCalls = 0;
  const unsubscribeDashboard = subscribeToDataDomains(['dashboard'], () => {
    dashboardCalls += 1;
  });
  const unsubscribeRecurrences = subscribeToDataDomains(['recurrences'], () => {
    recurrenceCalls += 1;
  });

  publishDataMutation(DATA_MUTATIONS.TRANSACTION_CREATED);

  assert.equal(dashboardCalls, 1);
  assert.equal(recurrenceCalls, 0);
  unsubscribeDashboard();
  unsubscribeRecurrences();
});

test('cleanup remove o assinante e mutacoes desconhecidas nao publicam', () => {
  let calls = 0;
  const unsubscribe = subscribeToDataDomains(['transactions'], () => {
    calls += 1;
  });

  unsubscribe();
  publishDataMutation(DATA_MUTATIONS.TRANSACTION_CREATED);

  assert.equal(calls, 0);
  assert.equal(publishDataMutation('UNKNOWN_MUTATION'), false);
});

test('serializa recargas e condensa eventos pendentes no mais recente', async () => {
  const resolvers = [];
  const received = [];
  const runner = createInvalidationRunner((detail) => new Promise((resolve) => {
    received.push(detail.sequence);
    resolvers.push(resolve);
  }));

  const firstRun = runner.run({ sequence: 1 });
  runner.run({ sequence: 2 });
  runner.run({ sequence: 3 });

  assert.deepEqual(received, [1]);
  resolvers.shift()();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(received, [1, 3]);
  resolvers.shift()();
  await firstRun;
  runner.dispose();
});

test('fluxos publicam e fecham somente depois da confirmacao da API', () => {
  const flowFiles = [
    ['../components/quickadd/flows/QuickTransactionFlow.jsx', 'await createTransaction(payload)'],
    ['../components/quickadd/flows/QuickTransferFlow.jsx', 'await createTransfer(payload)'],
    ['../components/quickadd/flows/QuickRecurrenceFlow.jsx', 'await createRecurrence(payload)'],
    ['../components/quickadd/flows/QuickGoalFlow.jsx', 'await createGoal(payload)']
  ];

  flowFiles.forEach(([file, apiCall]) => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    const apiIndex = source.indexOf(apiCall);
    const publishIndex = source.indexOf('publishDataMutation(', apiIndex);
    const closeIndex = source.indexOf('onClose()', publishIndex);

    assert.ok(apiIndex >= 0, `${file} deve aguardar a API`);
    assert.ok(publishIndex > apiIndex, `${file} deve publicar depois da API`);
    assert.ok(closeIndex > publishIndex, `${file} deve fechar depois da publicacao`);
  });
});

test('paginas principais preservam o estado atual ao recarregar', () => {
  const dashboardSource = readFileSync(new URL('../pages/Dashboard.jsx', import.meta.url), 'utf8');
  const transactionsSource = readFileSync(new URL('../pages/Transactions.jsx', import.meta.url), 'utf8');
  const invoicesSource = readFileSync(new URL('../pages/InvoicesPage.jsx', import.meta.url), 'utf8');

  assert.match(dashboardSource, /\[period, refreshVersion\]/);
  assert.match(transactionsSource, /loadTransactionsData\(filters, page\)/);
  assert.match(invoicesSource, /isCurrentView \? loadCurrentInvoices\(\) : loadInvoices\(\)/);
});
