const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

const MATCH_TYPES = ['CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'EQUALS', 'REGEX'];

const HEURISTICS = [
  { keywords: ['IFOOD', 'RESTAURANTE', 'LANCHONETE', 'PADARIA', 'PIZZARIA'], categoryName: 'Alimentacao' },
  { keywords: ['MERCADO', 'SUPERMERCADO', 'ATACADO'], categoryName: 'Mercado' },
  { keywords: ['UBER', '99', 'POSTO', 'COMBUSTIVEL', 'ESTACIONAMENTO'], categoryName: 'Transporte' },
  { keywords: ['NETFLIX', 'SPOTIFY', 'AMAZON PRIME', 'DISNEY', 'HBO', 'YOUTUBE PREMIUM'], categoryName: 'Assinaturas' },
  { keywords: ['SALARIO', 'PAGAMENTO', 'HOLERITE', 'DECIMO', 'FERIAS'], categoryName: 'Salario' }
];

function toRuleResponse(rule) {
  return {
    id: rule.id,
    name: rule.name,
    matchText: rule.match_text,
    matchType: rule.match_type,
    priority: rule.priority,
    isActive: rule.is_active,
    category: rule.category ? {
      id: rule.category.id,
      name: rule.category.name,
      type: rule.category.type
    } : null,
    createdAt: rule.created_at
  };
}

function validateRegex(pattern) {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function matchRule(text, rule) {
  const t = text || '';
  const m = rule.match_text || '';
  switch (rule.match_type) {
    case 'CONTAINS':
      return t.toUpperCase().includes(m.toUpperCase());
    case 'STARTS_WITH':
      return t.toUpperCase().startsWith(m.toUpperCase());
    case 'ENDS_WITH':
      return t.toUpperCase().endsWith(m.toUpperCase());
    case 'EQUALS':
      return t.toUpperCase() === m.toUpperCase();
    case 'REGEX':
      try {
        return new RegExp(m, 'i').test(t);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function applyHeuristic(description) {
  const upper = (description || '').toUpperCase();
  for (const h of HEURISTICS) {
    if (h.keywords.some((k) => upper.includes(k))) {
      return h.categoryName;
    }
  }
  return null;
}

async function findAccessibleCategory(categoryId, tenantId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      deleted_at: null,
      OR: [
        { tenant_id: null, is_default: true },
        { tenant_id: tenantId }
      ]
    }
  });
}

async function listRules(tenantId, filters) {
  const where = {
    tenant_id: tenantId,
    deleted_at: null
  };

  if (filters.active !== undefined && filters.active !== null) {
    where.is_active = filters.active === true || filters.active === 'true';
  }

  if (filters.search) {
    const search = filters.search.trim();
    if (search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { match_text: { contains: search, mode: 'insensitive' } }
      ];
    }
  }

  const rules = await prisma.categorizationRule.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { created_at: 'desc' }
    ]
  });

  return rules.map(toRuleResponse);
}

async function getRuleById(ruleId, tenantId) {
  const rule = await prisma.categorizationRule.findFirst({
    where: {
      id: ruleId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  if (!rule) {
    throw new AppError('Regra nao encontrada', 404);
  }

  return toRuleResponse(rule);
}

async function createRule(data, tenantId) {
  const category = await findAccessibleCategory(data.categoryId, tenantId);

  if (!category) {
    throw new AppError('Categoria nao encontrada para o tenant atual', 404);
  }

  if (!data.matchText || String(data.matchText).trim().length < 2) {
    throw new AppError('Texto de correspondencia deve ter no minimo 2 caracteres', 400);
  }

  if (!MATCH_TYPES.includes(data.matchType)) {
    throw new AppError('Tipo de correspondencia invalido', 400);
  }

  if (data.matchType === 'REGEX' && !validateRegex(data.matchText)) {
    throw new AppError('Expressao regular invalida', 400);
  }

  const rule = await prisma.categorizationRule.create({
    data: {
      tenant_id: tenantId,
      category_id: data.categoryId,
      name: data.name,
      match_text: String(data.matchText).trim(),
      match_type: data.matchType,
      priority: data.priority ?? 1,
      is_active: data.isActive !== undefined ? data.isActive : true
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  return toRuleResponse(rule);
}

async function updateRule(ruleId, tenantId, data) {
  const rule = await prisma.categorizationRule.findFirst({
    where: {
      id: ruleId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!rule) {
    throw new AppError('Regra nao encontrada', 404);
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.matchText !== undefined) {
    const text = String(data.matchText).trim();
    if (text.length < 2) {
      throw new AppError('Texto de correspondencia deve ter no minimo 2 caracteres', 400);
    }
    updateData.match_text = text;
  }

  if (data.matchType !== undefined) {
    if (!MATCH_TYPES.includes(data.matchType)) {
      throw new AppError('Tipo de correspondencia invalido', 400);
    }
    updateData.match_type = data.matchType;
  }

  if (data.categoryId !== undefined) {
    const category = await findAccessibleCategory(data.categoryId, tenantId);
    if (!category) {
      throw new AppError('Categoria nao encontrada para o tenant atual', 404);
    }
    updateData.category_id = data.categoryId;
  }

  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  if (data.isActive !== undefined) {
    updateData.is_active = data.isActive;
  }

  // Validate regex if resulting matchType is REGEX or if matchText changed and current matchType is REGEX
  const resultingMatchType = updateData.match_type || rule.match_type;
  const resultingMatchText = updateData.match_text || rule.match_text;
  if (resultingMatchType === 'REGEX' && !validateRegex(resultingMatchText)) {
    throw new AppError('Expressao regular invalida', 400);
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Informe ao menos um campo para atualizacao', 400);
  }

  const updated = await prisma.categorizationRule.update({
    where: { id: rule.id },
    data: updateData,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  return toRuleResponse(updated);
}

async function deleteRule(ruleId, tenantId) {
  const rule = await prisma.categorizationRule.findFirst({
    where: {
      id: ruleId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!rule) {
    throw new AppError('Regra nao encontrada', 404);
  }

  await prisma.categorizationRule.update({
    where: { id: rule.id },
    data: {
      deleted_at: new Date(),
      is_active: false
    }
  });

  return { message: 'Regra excluida com sucesso' };
}

async function findMatchingRule(description, tenantId) {
  const rules = await prisma.categorizationRule.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    },
    orderBy: [
      { priority: 'desc' },
      { created_at: 'asc' }
    ],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  for (const rule of rules) {
    if (matchRule(description, rule)) {
      return rule;
    }
  }

  return null;
}

async function testRule(description, tenantId) {
  const rule = await findMatchingRule(description, tenantId);

  if (!rule) {
    return {
      matched: false,
      rule: null,
      category: null
    };
  }

  return {
    matched: true,
    rule: {
      id: rule.id,
      name: rule.name,
      matchText: rule.match_text,
      matchType: rule.match_type
    },
    category: rule.category
      ? {
          id: rule.category.id,
          name: rule.category.name,
          type: rule.category.type
        }
      : null
  };
}

async function applyRules(data, tenantId) {
  const { onlyWithoutCategory, startDate, endDate } = data;

  const where = {
    tenant_id: tenantId,
    deleted_at: null
  };

  if (onlyWithoutCategory === true) {
    where.category_id = null;
  }

  if (startDate || endDate) {
    where.transaction_date = {};
    if (startDate) {
      where.transaction_date.gte = new Date(startDate);
    }
    if (endDate) {
      where.transaction_date.lte = new Date(endDate);
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      id: true,
      description: true,
      type: true,
      category_id: true
    }
  });

  const rules = await prisma.categorizationRule.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    },
    orderBy: [
      { priority: 'desc' },
      { created_at: 'asc' }
    ],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  let updated = 0;

  for (const transaction of transactions) {
    let matchedRule = null;

    for (const rule of rules) {
      if (matchRule(transaction.description, rule)) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule || !matchedRule.category) {
      continue;
    }

    // Do not apply category if transaction type is incompatible with category type,
    // except when transaction type is TRANSFER
    if (transaction.type !== 'TRANSFER' && matchedRule.category.type !== transaction.type) {
      continue;
    }

    // Skip if already has this category
    if (transaction.category_id === matchedRule.category.id) {
      continue;
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        category_id: matchedRule.category.id
      }
    });

    updated += 1;
  }

  return {
    processed: transactions.length,
    updated,
    message: 'Regras aplicadas com sucesso'
  };
}

async function getTenantCategories(tenantId) {
  const categories = await prisma.category.findMany({
    where: {
      is_active: true,
      deleted_at: null,
      OR: [
        { tenant_id: tenantId },
        { tenant_id: null, is_default: true }
      ]
    },
    select: {
      id: true,
      name: true,
      type: true
    }
  });
  return categories;
}

async function suggestCategoriesForTransactions(transactions, tenantId) {
  const rules = await prisma.categorizationRule.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    },
    orderBy: [
      { priority: 'desc' },
      { created_at: 'asc' }
    ],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  const categories = await getTenantCategories(tenantId);
  const mapByName = new Map();
  for (const c of categories) {
    mapByName.set(c.name.toUpperCase(), c);
  }

  return transactions.map((t) => {
    const description = t.description || '';
    let match = null;

    for (const rule of rules) {
      if (matchRule(description, rule)) {
        match = rule.category;
        break;
      }
    }

    if (!match) {
      const heuristicName = applyHeuristic(description);
      if (heuristicName && mapByName.has(heuristicName.toUpperCase())) {
        match = mapByName.get(heuristicName.toUpperCase());
      }
    }

    return {
      ...t,
      suggestedCategoryId: match ? match.id : null,
      suggestedCategoryName: match ? match.name : null
    };
  });
}

module.exports = {
  listRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  testRule,
  applyRules,
  findMatchingRule,
  suggestCategoriesForTransactions
};
