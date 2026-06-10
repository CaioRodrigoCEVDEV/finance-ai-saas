const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const goalsController = require('./goals.controller');
const {
  validateCreateGoal,
  validateUpdateGoal,
  validateUpdateGoalProgress,
  validateGoalParams,
  validateListGoalsQuery
} = require('./goals.validation');

const goalsRoutes = Router();

goalsRoutes.use('/goals', authenticate);

goalsRoutes.get('/goals/summary', validateListGoalsQuery, goalsController.getGoalsSummary);
goalsRoutes.get('/goals', validateListGoalsQuery, goalsController.listGoals);
goalsRoutes.get('/goals/:id', validateGoalParams, goalsController.getGoal);
goalsRoutes.post('/goals', requireWrite, validateCreateGoal, goalsController.createGoal);
goalsRoutes.put('/goals/:id', requireWrite, validateGoalParams, validateUpdateGoal, goalsController.updateGoal);
goalsRoutes.patch('/goals/:id/progress', requireWrite, validateGoalParams, validateUpdateGoalProgress, goalsController.updateGoalProgress);
goalsRoutes.delete('/goals/:id', requireWrite, validateGoalParams, goalsController.deleteGoal);

module.exports = goalsRoutes;
