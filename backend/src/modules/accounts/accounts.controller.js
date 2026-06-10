const accountsService = require('./accounts.service');

async function listAccounts(request, response, next) {
  try {
    const accounts = await accountsService.listAccounts(request.tenant.id);
    return response.json(accounts);
  } catch (error) {
    return next(error);
  }
}

async function getAccount(request, response, next) {
  try {
    const account = await accountsService.getAccountById(request.params.id, request.tenant.id);
    return response.json(account);
  } catch (error) {
    return next(error);
  }
}

async function createAccount(request, response, next) {
  try {
    const account = await accountsService.createAccount(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(account);
  } catch (error) {
    return next(error);
  }
}

async function updateAccount(request, response, next) {
  try {
    const account = await accountsService.updateAccount(request.params.id, request.tenant.id, request.body);
    return response.json(account);
  } catch (error) {
    return next(error);
  }
}

async function deleteAccount(request, response, next) {
  try {
    const result = await accountsService.deleteAccount(request.params.id, request.tenant.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount
};
