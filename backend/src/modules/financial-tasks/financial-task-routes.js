const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const financialTaskController = require('./financial-task-controller');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskParams,
  validateTaskItemParams,
  validateListTasksQuery,
  validateGenerateTransaction,
  validateCreateItem,
  validateUpdateItem,
  validateReorderItems
} = require('./financial-task-schema');

const financialTaskRoutes = Router();

financialTaskRoutes.use('/financial-tasks', authenticate);

financialTaskRoutes.get('/financial-tasks/dashboard', financialTaskController.getDashboardSummary);
financialTaskRoutes.get('/financial-tasks', validateListTasksQuery, financialTaskController.listTasks);
financialTaskRoutes.get('/financial-tasks/:id', validateTaskParams, financialTaskController.getTask);
financialTaskRoutes.post('/financial-tasks', requireWrite, validateCreateTask, financialTaskController.createTask);
financialTaskRoutes.put('/financial-tasks/:id', requireWrite, validateTaskParams, validateUpdateTask, financialTaskController.updateTask);
financialTaskRoutes.patch('/financial-tasks/:id/complete', requireWrite, validateTaskParams, financialTaskController.completeTask);
financialTaskRoutes.delete('/financial-tasks/:id', requireWrite, validateTaskParams, financialTaskController.deleteTask);
financialTaskRoutes.post('/financial-tasks/:id/generate-transaction', requireWrite, validateTaskParams, validateGenerateTransaction, financialTaskController.generateTransaction);

financialTaskRoutes.post('/financial-tasks/:id/items', requireWrite, validateTaskParams, validateCreateItem, financialTaskController.createItem);
financialTaskRoutes.put('/financial-tasks/:id/items/:itemId', requireWrite, validateTaskItemParams, validateUpdateItem, financialTaskController.updateItem);
financialTaskRoutes.delete('/financial-tasks/:id/items/:itemId', requireWrite, validateTaskItemParams, financialTaskController.deleteItem);
financialTaskRoutes.put('/financial-tasks/:id/items/reorder', requireWrite, validateTaskParams, validateReorderItems, financialTaskController.reorderItems);

module.exports = financialTaskRoutes;
