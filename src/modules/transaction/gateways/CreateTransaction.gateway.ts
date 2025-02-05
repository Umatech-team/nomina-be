import { TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  description: z.string().nullable(),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
});

export const CreateTransactionGateway = new ZodValidationPipe(
  createTransactionSchema,
);
