const transactionsService = require('./transactions.service');

async function listTransactions(request, response, next) {
  try {
    const data = await transactionsService.listTransactions(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getTransaction(request, response, next) {
  try {
    const data = await transactionsService.getTransactionById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createTransaction(request, response, next) {
  try {
    const data = await transactionsService.createTransaction(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateTransaction(request, response, next) {
  try {
    const data = await transactionsService.updateTransaction(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteTransaction(request, response, next) {
  try {
    const data = await transactionsService.deleteTransaction(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMonthSummary(request, response, next) {
  try {
    const data = await transactionsService.getMonthSummary(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthSummary
};
