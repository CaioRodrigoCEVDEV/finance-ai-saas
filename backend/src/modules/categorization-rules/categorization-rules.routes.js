const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
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
categorizationRulesRoutes.post(basePath, validateCreate, categorizationRulesController.createRule);
categorizationRulesRoutes.put(`${basePath}/:id`, validateParams, validateUpdate, categorizationRulesController.updateRule);
categorizationRulesRoutes.delete(`${basePath}/:id`, validateParams, categorizationRulesController.deleteRule);
categorizationRulesRoutes.post(`${basePath}/test`, validateTest, categorizationRulesController.testRule);
categorizationRulesRoutes.post(`${basePath}/apply`, validateApply, categorizationRulesController.applyRules);

module.exports = categorizationRulesRoutes;
