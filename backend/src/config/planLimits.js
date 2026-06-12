const PLAN_LIMITS = {
  FREE: {
    maxAccounts: 1,
    maxCreditCards: 1,
    maxBudgets: null,
    maxGoals: null,
    canImportFiles: false,
    canUseReports: false,
    canUseCategorizationRules: false,
    canUseOpenFinance: false,
    canUseAI: false,
  },
  PREMIUM: {
    maxAccounts: null,
    maxCreditCards: null,
    maxBudgets: null,
    maxGoals: null,
    canImportFiles: true,
    canUseReports: true,
    canUseCategorizationRules: true,
    canUseOpenFinance: true,
    canUseAI: true,
  },
};

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

module.exports = { PLAN_LIMITS, getPlanLimits };
