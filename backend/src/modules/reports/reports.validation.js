const { z } = require('zod');

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT']).optional()
}).strict();

const exportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT']).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED']).optional()
}).strict();

const topExpensesQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT']).optional(),
  limit: z.string().optional()
}).strict();

module.exports = {
  querySchema,
  exportQuerySchema,
  topExpensesQuerySchema
};
