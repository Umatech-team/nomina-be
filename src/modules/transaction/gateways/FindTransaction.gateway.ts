import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findTransactionsSchema = z.object({
  transactionId: z.number(),
});

export const FindTransactionsGateway = new ZodValidationPipe(
  findTransactionsSchema,
);
