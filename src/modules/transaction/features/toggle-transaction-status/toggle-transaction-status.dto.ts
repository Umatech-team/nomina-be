import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const toggleTransactionStatusSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
});

export const ToggleTransactionStatusPipe = new ZodValidationPipe(
  toggleTransactionStatusSchema,
);
export type ToggleTransactionStatusRequest = z.infer<
  typeof toggleTransactionStatusSchema
>;
