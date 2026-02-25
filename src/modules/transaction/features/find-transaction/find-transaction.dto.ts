import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findTransactionSchema = z.object({
  transactionId: z.string(),
});

export const FindTransactionPipe = new ZodValidationPipe(findTransactionSchema);
export type FindTransactionRequest = z.infer<typeof findTransactionSchema>;
