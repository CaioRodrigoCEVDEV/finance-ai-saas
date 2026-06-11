const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

const DEFAULTS = {
  currency: 'BRL',
  financialMonthStartDay: 1,
  theme: 'system',
  dateFormat: 'DD/MM/YYYY',
  notifyBudgetWarning: true,
  notifyBudgetExceeded: true,
  notifyInvoiceDue: true,
  notifyGoalBehind: false
};

function toSettingsResponse(settings) {
  return {
    id: settings.id,
    currency: settings.currency,
    financialMonthStartDay: settings.financial_month_start_day,
    defaultAccountId: settings.default_account_id,
    defaultExpenseCategoryId: settings.default_expense_category_id,
    theme: settings.theme,
    dateFormat: settings.date_format,
    notifications: {
      budgetWarning: settings.notify_budget_warning,
      budgetExceeded: settings.notify_budget_exceeded,
      invoiceDue: settings.notify_invoice_due,
      goalBehind: settings.notify_goal_behind
    },
    createdAt: settings.created_at,
    updatedAt: settings.updated_at
  };
}

async function getOrCreateSettings(tenantId) {
  let settings = await prisma.tenantSettings.findUnique({
    where: { tenant_id: tenantId }
  });

  if (!settings) {
    settings = await prisma.tenantSettings.create({
      data: {
        tenant_id: tenantId,
        currency: DEFAULTS.currency,
        financial_month_start_day: DEFAULTS.financialMonthStartDay,
        theme: DEFAULTS.theme,
        date_format: DEFAULTS.dateFormat,
        notify_budget_warning: DEFAULTS.notifyBudgetWarning,
        notify_budget_exceeded: DEFAULTS.notifyBudgetExceeded,
        notify_invoice_due: DEFAULTS.notifyInvoiceDue,
        notify_goal_behind: DEFAULTS.notifyGoalBehind
      }
    });
  }

  return toSettingsResponse(settings);
}

async function updateSettings(tenantId, data) {
  const current = await prisma.tenantSettings.findUnique({
    where: { tenant_id: tenantId },
    select: { id: true }
  });

  if (!current) {
    throw new AppError('Configuracoes nao encontradas para este workspace', 404);
  }

  if (data.defaultAccountId) {
    const account = await prisma.account.findFirst({
      where: {
        id: data.defaultAccountId,
        tenant_id: tenantId,
        deleted_at: null,
        is_active: true
      }
    });

    if (!account) {
      throw new AppError('Conta padrao nao encontrada ou nao pertence ao seu workspace', 400);
    }
  }

  if (data.defaultExpenseCategoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.defaultExpenseCategoryId,
        type: 'EXPENSE',
        OR: [
          { tenant_id: null, is_default: true },
          { tenant_id: tenantId }
        ],
        deleted_at: null,
        is_active: true
      }
    });

    if (!category) {
      throw new AppError('Categoria padrao nao encontrada, nao e do tipo EXPENSE ou nao pertence ao seu workspace', 400);
    }
  }

  const updateData = {};

  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.financialMonthStartDay !== undefined) updateData.financial_month_start_day = data.financialMonthStartDay;
  if (data.defaultAccountId !== undefined) updateData.default_account_id = data.defaultAccountId;
  if (data.defaultExpenseCategoryId !== undefined) updateData.default_expense_category_id = data.defaultExpenseCategoryId;
  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.dateFormat !== undefined) updateData.date_format = data.dateFormat;

  if (data.notifications) {
    if (data.notifications.budgetWarning !== undefined) updateData.notify_budget_warning = data.notifications.budgetWarning;
    if (data.notifications.budgetExceeded !== undefined) updateData.notify_budget_exceeded = data.notifications.budgetExceeded;
    if (data.notifications.invoiceDue !== undefined) updateData.notify_invoice_due = data.notifications.invoiceDue;
    if (data.notifications.goalBehind !== undefined) updateData.notify_goal_behind = data.notifications.goalBehind;
  }

  const updated = await prisma.tenantSettings.update({
    where: { tenant_id: tenantId },
    data: updateData
  });

  return toSettingsResponse(updated);
}

module.exports = {
  getOrCreateSettings,
  updateSettings
};
