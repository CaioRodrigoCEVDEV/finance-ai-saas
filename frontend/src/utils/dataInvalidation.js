import { useEffect, useRef } from 'react';

const EVENT_NAME = 'finance-ai:data-invalidated';

export const DATA_MUTATIONS = Object.freeze({
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  TRANSACTION_CHANGED: 'TRANSACTION_CHANGED',
  TRANSFER_CREATED: 'TRANSFER_CREATED',
  INVOICE_PAYMENT_CHANGED: 'INVOICE_PAYMENT_CHANGED',
  RECURRENCE_CREATED: 'RECURRENCE_CREATED',
  GOAL_CREATED: 'GOAL_CREATED',
  IMPORT_CONFIRMED: 'IMPORT_CONFIRMED'
});

const MUTATION_DOMAINS = Object.freeze({
  [DATA_MUTATIONS.TRANSACTION_CREATED]: ['dashboard', 'transactions', 'accounts', 'creditCards', 'invoices', 'budgets', 'calendar', 'reports'],
  [DATA_MUTATIONS.TRANSACTION_CHANGED]: ['dashboard', 'transactions', 'accounts', 'creditCards', 'invoices', 'budgets', 'calendar', 'reports'],
  [DATA_MUTATIONS.TRANSFER_CREATED]: ['dashboard', 'transactions', 'accounts', 'calendar', 'reports'],
  [DATA_MUTATIONS.INVOICE_PAYMENT_CHANGED]: ['dashboard', 'transactions', 'accounts', 'creditCards', 'invoices', 'calendar', 'reports'],
  [DATA_MUTATIONS.RECURRENCE_CREATED]: ['recurrences', 'calendar'],
  [DATA_MUTATIONS.GOAL_CREATED]: ['goals', 'dashboard'],
  [DATA_MUTATIONS.IMPORT_CONFIRMED]: ['dashboard', 'transactions', 'accounts', 'creditCards', 'invoices', 'budgets', 'calendar', 'reports']
});

const invalidationTarget = new EventTarget();

export function getMutationDomains(mutation) {
  return MUTATION_DOMAINS[mutation] || [];
}

export function publishDataMutation(mutation, detail = {}) {
  const domains = getMutationDomains(mutation);

  if (domains.length === 0) {
    return false;
  }

  const eventDetail = { mutation, domains, ...detail };
  const event = typeof CustomEvent === 'function'
    ? new CustomEvent(EVENT_NAME, { detail: eventDetail })
    : Object.assign(new Event(EVENT_NAME), { detail: eventDetail });

  invalidationTarget.dispatchEvent(event);
  return true;
}

export function subscribeToDataDomains(domains, callback) {
  const subscribedDomains = new Set(domains);
  const handleInvalidation = (event) => {
    if (event.detail.domains.some((domain) => subscribedDomains.has(domain))) {
      callback(event.detail);
    }
  };

  invalidationTarget.addEventListener(EVENT_NAME, handleInvalidation);

  return () => invalidationTarget.removeEventListener(EVENT_NAME, handleInvalidation);
}

export function createInvalidationRunner(callback) {
  let running = false;
  let pendingDetail = null;
  let active = true;

  async function run(detail) {
    if (!active) {
      return;
    }

    if (running) {
      pendingDetail = detail;
      return;
    }

    running = true;
    let currentDetail = detail;

    while (currentDetail && active) {
      pendingDetail = null;

      try {
        await callback(currentDetail);
      } catch (_error) {
      }

      currentDetail = pendingDetail;
    }

    running = false;
  }

  return {
    run,
    dispose() {
      active = false;
      pendingDetail = null;
    }
  };
}

export function useDataInvalidation(domains, callback) {
  const callbackRef = useRef(callback);
  const domainKey = [...domains].sort().join('|');

  callbackRef.current = callback;

  useEffect(() => {
    const runner = createInvalidationRunner((detail) => callbackRef.current(detail));
    const unsubscribe = subscribeToDataDomains(
      domainKey.split('|').filter(Boolean),
      runner.run
    );

    return () => {
      runner.dispose();
      unsubscribe();
    };
  }, [domainKey]);
}
