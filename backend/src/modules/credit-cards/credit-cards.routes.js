const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const creditCardsController = require('./credit-cards.controller');
const {
  validateCreateCreditCard,
  validateUpdateCreditCard,
  validateCreditCardParams
} = require('./credit-cards.validation');

const creditCardsRoutes = Router();

creditCardsRoutes.use('/credit-cards', authenticate);

creditCardsRoutes.get('/credit-cards', creditCardsController.listCreditCards);
creditCardsRoutes.get('/credit-cards/:id', validateCreditCardParams, creditCardsController.getCreditCard);
creditCardsRoutes.post('/credit-cards', requireWrite, validateCreateCreditCard, creditCardsController.createCreditCard);
creditCardsRoutes.put('/credit-cards/:id', requireWrite, validateCreditCardParams, validateUpdateCreditCard, creditCardsController.updateCreditCard);
creditCardsRoutes.delete('/credit-cards/:id', requireWrite, validateCreditCardParams, creditCardsController.deleteCreditCard);

module.exports = creditCardsRoutes;
