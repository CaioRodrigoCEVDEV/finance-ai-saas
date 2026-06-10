const categorizationRulesService = require('./categorization-rules.service');

async function listRules(request, response, next) {
  try {
    const rules = await categorizationRulesService.listRules(request.tenant.id, request.query);
    return response.json(rules);
  } catch (error) {
    return next(error);
  }
}

async function getRule(request, response, next) {
  try {
    const rule = await categorizationRulesService.getRuleById(request.params.id, request.tenant.id);
    return response.json(rule);
  } catch (error) {
    return next(error);
  }
}

async function createRule(request, response, next) {
  try {
    const rule = await categorizationRulesService.createRule(request.body, request.tenant.id);
    return response.status(201).json(rule);
  } catch (error) {
    return next(error);
  }
}

async function updateRule(request, response, next) {
  try {
    const rule = await categorizationRulesService.updateRule(request.params.id, request.tenant.id, request.body);
    return response.json(rule);
  } catch (error) {
    return next(error);
  }
}

async function deleteRule(request, response, next) {
  try {
    const result = await categorizationRulesService.deleteRule(request.params.id, request.tenant.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function testRule(request, response, next) {
  try {
    const result = await categorizationRulesService.testRule(request.body.description, request.tenant.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function applyRules(request, response, next) {
  try {
    const result = await categorizationRulesService.applyRules(request.body, request.tenant.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  testRule,
  applyRules
};
