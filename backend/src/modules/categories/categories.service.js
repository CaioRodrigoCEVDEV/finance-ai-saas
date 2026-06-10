const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toCategoryResponse(category) {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    parentId: category.parent_id,
    color: category.color,
    icon: category.icon,
    isDefault: category.is_default,
    isActive: category.is_active
  };
}

function buildAccessibleCategoryWhere(categoryId, tenantId) {
  return {
    id: categoryId,
    deleted_at: null,
    OR: [
      {
        tenant_id: null,
        is_default: true
      },
      {
        tenant_id: tenantId
      }
    ]
  };
}

async function findAccessibleCategory(categoryId, tenantId) {
  return prisma.category.findFirst({
    where: buildAccessibleCategoryWhere(categoryId, tenantId)
  });
}

async function assertValidParentCategory(parentId, tenantId, categoryType, categoryId) {
  if (parentId === undefined) {
    return undefined;
  }

  if (parentId === null) {
    return null;
  }

  if (categoryId && parentId === categoryId) {
    throw new AppError('Categoria pai invalida', 400);
  }

  const parentCategory = await findAccessibleCategory(parentId, tenantId);

  if (!parentCategory) {
    throw new AppError('Categoria pai nao encontrada', 404);
  }

  if (parentCategory.type !== categoryType) {
    throw new AppError('Categoria pai deve possuir o mesmo tipo da categoria', 400);
  }

  return parentCategory.id;
}

async function listCategories(tenantId, filters) {
  const where = {
    deleted_at: null,
    OR: [
      {
        tenant_id: null,
        is_default: true
      },
      {
        tenant_id: tenantId
      }
    ]
  };

  if (!filters.includeInactive) {
    where.is_active = true;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  });

  return categories.map(toCategoryResponse);
}

async function getCategoryById(categoryId, tenantId) {
  const category = await findAccessibleCategory(categoryId, tenantId);

  if (!category) {
    throw new AppError('Categoria nao encontrada', 404);
  }

  return toCategoryResponse(category);
}

async function createCategory(data, tenantId) {
  const parentId = await assertValidParentCategory(data.parentId, tenantId, data.type);

  const category = await prisma.category.create({
    data: {
      tenant_id: tenantId,
      name: data.name,
      type: data.type,
      parent_id: parentId ?? null,
      color: data.color ?? null,
      icon: data.icon ?? null,
      is_default: false,
      is_active: true
    }
  });

  return toCategoryResponse(category);
}

async function updateCategory(categoryId, tenantId, data) {
  const category = await findAccessibleCategory(categoryId, tenantId);

  if (!category) {
    throw new AppError('Categoria nao encontrada', 404);
  }

  if (category.tenant_id === null && category.is_default) {
    throw new AppError('Categorias padrao nao podem ser editadas', 403);
  }

  const nextType = data.type ?? category.type;
  const nextParentId = await assertValidParentCategory(data.parentId, tenantId, nextType, category.id);
  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.parentId !== undefined) {
    updateData.parent_id = nextParentId;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.isActive !== undefined) {
    updateData.is_active = data.isActive;
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: category.id
    },
    data: updateData
  });

  return toCategoryResponse(updatedCategory);
}

async function deleteCategory(categoryId, tenantId) {
  const category = await findAccessibleCategory(categoryId, tenantId);

  if (!category) {
    throw new AppError('Categoria nao encontrada', 404);
  }

  if (category.tenant_id === null && category.is_default) {
    throw new AppError('Categorias padrao nao podem ser excluidas', 403);
  }

  const linkedTransactionsCount = await prisma.transaction.count({
    where: {
      tenant_id: tenantId,
      category_id: category.id,
      deleted_at: null
    }
  });

  if (linkedTransactionsCount > 0) {
    throw new AppError('Categoria possui transacoes vinculadas e nao pode ser excluida.', 400);
  }

  await prisma.category.update({
    where: {
      id: category.id
    },
    data: {
      deleted_at: new Date(),
      is_active: false
    }
  });

  return {
    message: 'Categoria excluida com sucesso'
  };
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
