const budgetsService = require('./budgets.service');

async function listBudgets(request, response, next) {
  try {
    const data = await budgetsService.listBudgets(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getBudget(request, response, next) {
  try {
    const data = await budgetsService.getBudgetById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createBudget(request, response, next) {
  try {
    const data = await budgetsService.createBudget(request.body, request.tenant.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateBudget(request, response, next) {
  try {
    const data = await budgetsService.updateBudget(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteBudget(request, response, next) {
  try {
    const data = await budgetsService.deleteBudget(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMonthSummary(request, response, next) {
  try {
    const data = await budgetsService.getMonthSummary(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getMonthSummary
};
