const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const categorizationRulesController = require('./categorization-rules.controller');
const {
  validateQuery,
  validateParams,
  validateCreate,
  validateUpdate,
  validateTest,
  validateApply
} = require('./categorization-rules.validation');

const categorizationRulesRoutes = Router();

const basePath = '/categorization-rules';

categorizationRulesRoutes.use(basePath, authenticate);

categorizationRulesRoutes.get(basePath, validateQuery, categorizationRulesController.listRules);
categorizationRulesRoutes.get(`${basePath}/:id`, validateParams, categorizationRulesController.getRule);
categorizationRulesRoutes.post(basePath, requireWrite, validateCreate, categorizationRulesController.createRule);
categorizationRulesRoutes.put(`${basePath}/:id`, requireWrite, validateParams, validateUpdate, categorizationRulesController.updateRule);
categorizationRulesRoutes.delete(`${basePath}/:id`, requireWrite, validateParams, categorizationRulesController.deleteRule);
categorizationRulesRoutes.post(`${basePath}/test`, requireWrite, validateTest, categorizationRulesController.testRule);
categorizationRulesRoutes.post(`${basePath}/apply`, requireWrite, validateApply, categorizationRulesController.applyRules);

module.exports = categorizationRulesRoutes;
