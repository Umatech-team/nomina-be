import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const deleteRecurringTransactionSchema = z.object({
  recurringTransactionId: z
    .string()
    .uuid('ID da transação recorrente inválido'),
});

export type DeleteRecurringTransactionRequest = z.infer<
  typeof deleteRecurringTransactionSchema
>;
export const DeleteRecurringTransactionPipe = new ZodValidationPipe(
  deleteRecurringTransactionSchema,
);
