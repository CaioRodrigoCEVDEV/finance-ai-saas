const { z } = require('zod');
const AppError = require('../../utils/app-error');

const previewQuerySchema = z.object({
  accountId: z.string().uuid().optional().or(z.literal('')),
  creditCardId: z.string().uuid().optional().or(z.literal(''))
});

const confirmBodySchema = z.object({
  accountId: z.string().uuid().optional().nullable(),
  creditCardId: z.string().uuid().optional().nullable(),
  source: z.enum(['CSV', 'OFX']),
  transactions: z.array(
    z.object({
      externalId: z.string().optional().nullable(),
      description: z.string().min(1, 'Descricao obrigatoria'),
      amount: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT']),
      transactionDate: z.string().min(1, 'Data obrigatoria'),
      paymentMethod: z.string().optional().nullable(),
      categoryId: z.string().uuid().optional().nullable(),
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED']).optional(),
      notes: z.string().optional().nullable(),
      isValid: z.boolean().optional()
    })
  ).min(1, 'Informe ao menos uma transacao')
});

function validatePreviewQuery(request, _response, next) {
  const parsed = previewQuerySchema.safeParse(request.body);
  if (!parsed.success) {
    return next(new AppError(parsed.error.issues[0]?.message || 'Dados invalidos', 400));
  }
  return next();
}

function validateConfirmBody(request, _response, next) {
  const parsed = confirmBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return next(new AppError(parsed.error.issues[0]?.message || 'Dados invalidos', 400));
  }
  return next();
}

module.exports = {
  validatePreviewQuery,
  validateConfirmBody
};
