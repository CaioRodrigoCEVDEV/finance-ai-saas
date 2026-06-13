import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { formatCurrencyBRL } from '../utils/formatters';

const PrivacyContext = createContext(null);

const STORAGE_KEY = 'finance-ai-hide-values';
const MASKED_CURRENCY = 'R$ ••••••';
const MASKED_VALUE = '••••••';

function getStoredPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_error) {
    return false;
  }
}

function PrivacyProvider({ children }) {
  const [hideValues, setHideValues] = useState(getStoredPreference);

  const toggleHideValues = useCallback(() => {
    setHideValues((current) => {
      const next = !current;

      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (_error) {
        // localStorage can be unavailable in private browsing or restricted contexts.
      }

      return next;
    });
  }, []);

  const maskValue = useCallback((_value, withCurrency = false) => (
    withCurrency ? MASKED_CURRENCY : MASKED_VALUE
  ), []);

  const formatCurrencyPrivacy = useCallback((value) => (
    hideValues ? maskValue(value, true) : formatCurrencyBRL(value)
  ), [hideValues, maskValue]);

  const value = useMemo(() => ({
    hideValues,
    toggleHideValues,
    formatCurrencyPrivacy,
    maskValue
  }), [hideValues, toggleHideValues, formatCurrencyPrivacy, maskValue]);

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
}

function usePrivacy() {
  const context = useContext(PrivacyContext);

  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }

  return context;
}

export { PrivacyProvider, usePrivacy };
