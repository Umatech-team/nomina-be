import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const deleteTransactionSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
});

export type DeleteTransactionRequest = z.infer<typeof deleteTransactionSchema>;
export const DeleteTransactionPipe = new ZodValidationPipe(
  deleteTransactionSchema,
);
