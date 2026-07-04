const financialTaskService = require('./financial-task-service');

async function listTasks(request, response, next) {
  try {
    const data = await financialTaskService.listTasks(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getTask(request, response, next) {
  try {
    const data = await financialTaskService.getTaskById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createTask(request, response, next) {
  try {
    const data = await financialTaskService.createTask(request.body, request.tenant.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateTask(request, response, next) {
  try {
    const data = await financialTaskService.updateTask(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function completeTask(request, response, next) {
  try {
    const data = await financialTaskService.completeTask(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(request, response, next) {
  try {
    const data = await financialTaskService.deleteTask(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getDashboardSummary(request, response, next) {
  try {
    const data = await financialTaskService.getDashboardSummary(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function generateTransaction(request, response, next) {
  try {
    const data = await financialTaskService.generateTransaction(
      request.params.id,
      request.tenant.id,
      request.body
    );
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function createItem(request, response, next) {
  try {
    const data = await financialTaskService.createItem(request.params.id, request.tenant.id, request.body);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateItem(request, response, next) {
  try {
    const data = await financialTaskService.updateItem(request.params.id, request.tenant.id, request.params.itemId, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteItem(request, response, next) {
  try {
    const data = await financialTaskService.deleteItem(request.params.id, request.tenant.id, request.params.itemId);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function reorderItems(request, response, next) {
  try {
    const data = await financialTaskService.reorderItems(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getDashboardSummary,
  generateTransaction,
  createItem,
  updateItem,
  deleteItem,
  reorderItems
};
