import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const toggleActiveRecurringTransactionSchema = z.object({
  recurringTransactionId: z.string(),
});

export const ToggleActiveRecurringTransactionPipe = new ZodValidationPipe(
  toggleActiveRecurringTransactionSchema,
);
export type ToggleActiveRecurringTransactionRequest = z.infer<
  typeof toggleActiveRecurringTransactionSchema
>;
