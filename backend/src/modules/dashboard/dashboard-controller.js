const dashboardService = require('./dashboard-service');

async function getSummary(request, response, next) {
  try {
    const data = await dashboardService.getSummary(request.tenant.id);

    return response.json({
      tenant: request.tenant,
      ...data
    });
  } catch (error) {
    return next(error);
  }
}

async function getExpensesByCategory(request, response, next) {
  try {
    const data = await dashboardService.getExpensesByCategory(request.tenant.id);

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getRecentTransactions(request, response, next) {
  try {
    const data = await dashboardService.getRecentTransactions(request.tenant.id);

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMonthlyFlow(request, response, next) {
  try {
    const data = await dashboardService.getMonthlyFlow(request.tenant.id);

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary
};
