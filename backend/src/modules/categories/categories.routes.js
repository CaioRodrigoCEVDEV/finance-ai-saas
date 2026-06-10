const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const categoriesController = require('./categories.controller');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryParams,
  validateCategoryQuery
} = require('./categories.validation');

const categoriesRoutes = Router();

categoriesRoutes.use('/categories', authenticate);

categoriesRoutes.get('/categories', validateCategoryQuery, categoriesController.listCategories);
categoriesRoutes.get('/categories/:id', validateCategoryParams, categoriesController.getCategory);
categoriesRoutes.post('/categories', requireWrite, validateCreateCategory, categoriesController.createCategory);
categoriesRoutes.put('/categories/:id', requireWrite, validateCategoryParams, validateUpdateCategory, categoriesController.updateCategory);
categoriesRoutes.delete('/categories/:id', requireWrite, validateCategoryParams, categoriesController.deleteCategory);

module.exports = categoriesRoutes;
