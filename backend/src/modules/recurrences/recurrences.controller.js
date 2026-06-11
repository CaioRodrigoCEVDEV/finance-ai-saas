const recurrencesService = require('./recurrences.service');

async function listRecurrences(request, response, next) {
  try {
    const data = await recurrencesService.listRecurrences(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getRecurrence(request, response, next) {
  try {
    const data = await recurrencesService.getRecurrenceById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createRecurrence(request, response, next) {
  try {
    const data = await recurrencesService.createRecurrence(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateRecurrence(request, response, next) {
  try {
    const data = await recurrencesService.updateRecurrence(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateRecurrenceStatus(request, response, next) {
  try {
    const data = await recurrencesService.updateRecurrenceStatus(request.params.id, request.tenant.id, request.body.status);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteRecurrence(request, response, next) {
  try {
    const data = await recurrencesService.deleteRecurrence(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function generateTransaction(request, response, next) {
  try {
    const data = await recurrencesService.generateTransaction(request.params.id, request.tenant.id, request.user.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listRecurrences,
  getRecurrence,
  createRecurrence,
  updateRecurrence,
  updateRecurrenceStatus,
  deleteRecurrence,
  generateTransaction
};
