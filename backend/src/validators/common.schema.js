const { z } = require('zod');

const idSchema = z
  .string()
  .min(10, 'ID inválido')
  .max(40, 'ID inválido')
  .refine(
    (val) => /^[a-zA-Z0-9_-]+$/.test(val),
    'ID inválido'
  );

const paramsIdSchema = z.object({
  id: idSchema
});

module.exports = { idSchema, paramsIdSchema };
