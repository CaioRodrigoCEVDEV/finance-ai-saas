const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
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
categoriesRoutes.post('/categories', validateCreateCategory, categoriesController.createCategory);
categoriesRoutes.put('/categories/:id', validateCategoryParams, validateUpdateCategory, categoriesController.updateCategory);
categoriesRoutes.delete('/categories/:id', validateCategoryParams, categoriesController.deleteCategory);

module.exports = categoriesRoutes;
