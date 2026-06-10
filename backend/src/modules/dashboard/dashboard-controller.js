const dashboardService = require('./dashboard-service');

async function getSummary(_request, response, next) {
  try {
    const data = await dashboardService.getSummary();

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getExpensesByCategory(_request, response, next) {
  try {
    const data = await dashboardService.getExpensesByCategory();

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getRecentTransactions(_request, response, next) {
  try {
    const data = await dashboardService.getRecentTransactions();

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMonthlyFlow(_request, response, next) {
  try {
    const data = await dashboardService.getMonthlyFlow();

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
