const transfersService = require('./transfers.service');

async function listTransfers(request, response, next) {
  try {
    const data = await transfersService.listTransfers(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getTransfer(request, response, next) {
  try {
    const data = await transfersService.getTransferById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createTransfer(request, response, next) {
  try {
    const data = await transfersService.createTransfer(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateTransfer(request, response, next) {
  try {
    const data = await transfersService.updateTransfer(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteTransfer(request, response, next) {
  try {
    const data = await transfersService.deleteTransfer(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer
};
