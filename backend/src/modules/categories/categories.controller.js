const categoriesService = require('./categories.service');

async function listCategories(request, response, next) {
  try {
    const categories = await categoriesService.listCategories(request.tenant.id, request.query);
    return response.json(categories);
  } catch (error) {
    return next(error);
  }
}

async function getCategory(request, response, next) {
  try {
    const category = await categoriesService.getCategoryById(request.params.id, request.tenant.id);
    return response.json(category);
  } catch (error) {
    return next(error);
  }
}

async function createCategory(request, response, next) {
  try {
    const category = await categoriesService.createCategory(request.body, request.tenant.id);
    return response.status(201).json(category);
  } catch (error) {
    return next(error);
  }
}

async function updateCategory(request, response, next) {
  try {
    const category = await categoriesService.updateCategory(request.params.id, request.tenant.id, request.body);
    return response.json(category);
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(request, response, next) {
  try {
    const result = await categoriesService.deleteCategory(request.params.id, request.tenant.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
