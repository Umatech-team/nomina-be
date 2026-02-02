import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findRecurringTransactionSchema = z.object({
  recurringTransactionId: z
    .string()
    .uuid('ID da transação recorrente inválido'),
});

export const FindRecurringTransactionGateway = new ZodValidationPipe(
  findRecurringTransactionSchema,
);
