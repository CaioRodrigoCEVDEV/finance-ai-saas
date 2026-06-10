const creditCardsService = require('./credit-cards.service');

async function listCreditCards(request, response, next) {
  try {
    const data = await creditCardsService.listCreditCards(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getCreditCard(request, response, next) {
  try {
    const data = await creditCardsService.getCreditCardById(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createCreditCard(request, response, next) {
  try {
    const data = await creditCardsService.createCreditCard(request.body, request.tenant.id, request.user.id);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateCreditCard(request, response, next) {
  try {
    const data = await creditCardsService.updateCreditCard(request.params.id, request.tenant.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteCreditCard(request, response, next) {
  try {
    const data = await creditCardsService.deleteCreditCard(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCreditCards,
  getCreditCard,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard
};
