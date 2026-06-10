const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { parseCsv } = require('./parsers/csvParser');
const { parseOfx } = require('./parsers/ofxParser');
const { suggestCategoriesForTransactions } = require('../categorization-rules/categorization-rules.service');

const ALLOWED_EXTENSIONS = ['.csv', '.ofx'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file) {
  if (!file) {
    throw new AppError('Arquivo nao enviado', 400);
  }

  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError('Extensao de arquivo nao permitida. Use CSV ou OFX.', 400);
  }

  if (file.size > MAX_SIZE) {
    throw new AppError('Arquivo excede o tamanho maximo de 5MB.', 400);
  }

  return ext;
}

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

async function validateAccountOrCreditCard(accountId, creditCardId, tenantId) {
  if (accountId) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, tenant_id: tenantId, deleted_at: null }
    });
    if (!account) {
      throw new AppError('Conta nao encontrada para o tenant atual', 404);
    }
  }

  if (creditCardId) {
    const card = await prisma.creditCard.findFirst({
      where: { id: creditCardId, tenant_id: tenantId, deleted_at: null }
    });
    if (!card) {
      throw new AppError('Cartao de credito nao encontrado para o tenant atual', 404);
    }
  }

  if (!accountId && !creditCardId) {
    // Not required for preview, but optional
  }
}

async function previewFile(file, accountId, creditCardId, tenantId) {
  const ext = validateFile(file);
  await validateAccountOrCreditCard(accountId, creditCardId, tenantId);

  let result;
  if (ext === '.csv') {
    result = parseCsv(file.buffer);
  } else {
    result = parseOfx(file.buffer);
  }

  const enriched = await suggestCategoriesForTransactions(result.transactions, tenantId);

  return {
    fileName: file.originalname,
    totalRows: result.totalRows,
    validRows: result.validRows,
    invalidRows: result.invalidRows,
    transactions: enriched
  };
}

async function validateCategory(categoryId, tenantId) {
  if (!categoryId) return null;
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      is_active: true,
      deleted_at: null,
      OR: [
        { tenant_id: tenantId },
        { tenant_id: null, is_default: true }
      ]
    }
  });
  if (!category) {
    throw new AppError('Categoria nao encontrada para o tenant atual', 404);
  }
  return category;
}

async function confirmImport(data, tenantId, userId) {
  const { accountId, creditCardId, source, transactions } = data;

  if (!accountId && !creditCardId) {
    throw new AppError('Informe uma conta ou um cartao de credito', 400);
  }

  if (!['CSV', 'OFX'].includes(source)) {
    throw new AppError('Fonte invalida. Use CSV ou OFX.', 400);
  }

  await validateAccountOrCreditCard(accountId, creditCardId, tenantId);

  const validTransactions = (transactions || []).filter((t) => t.isValid !== false);

  let created = 0;
  let skipped = 0;

  for (const t of validTransactions) {
    if (t.categoryId) {
      await validateCategory(t.categoryId, tenantId);
    }

    const existing = await prisma.transaction.findFirst({
      where: {
        tenant_id: tenantId,
        external_id: t.externalId || null,
        source: source
      }
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.transaction.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        account_id: accountId || null,
        credit_card_id: creditCardId || null,
        category_id: t.categoryId || null,
        description: t.description,
        amount: toDecimalString(t.amount),
        type: t.type,
        status: t.status || 'CONFIRMED',
        transaction_date: new Date(t.transactionDate),
        payment_method: t.paymentMethod || 'OTHER',
        notes: t.notes || `Importado via ${source}`,
        source: source,
        external_id: t.externalId || null,
        is_recurring: false,
        is_installment: false
      }
    });

    created += 1;
  }

  return {
    created,
    skipped,
    message: 'Importacao concluida'
  };
}

module.exports = {
  previewFile,
  confirmImport
};
