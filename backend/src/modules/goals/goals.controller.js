const goalsService = require('./goals.service');

async function listGoals(request, response, next) {
  try {
    const data = await goalsService.listGoals(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getGoal(request, response, next) {
  try {
    const data = await goalsService.getGoalById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createGoal(request, response, next) {
  try {
    const data = await goalsService.createGoal(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateGoal(request, response, next) {
  try {
    const data = await goalsService.updateGoal(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateGoalProgress(request, response, next) {
  try {
    const data = await goalsService.updateGoalProgress(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteGoal(request, response, next) {
  try {
    const data = await goalsService.deleteGoal(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getGoalsSummary(request, response, next) {
  try {
    const data = await goalsService.getGoalsSummary(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsSummary
};
