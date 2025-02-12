import { TransactionMethod, TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createTransactionSchema = z.object({
  title: z.string(),
  type: z.nativeEnum(TransactionType),
  method: z.nativeEnum(TransactionMethod),
  description: z.string().nullable(),
  category: z.string(),
  subCategory: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
});

export const CreateTransactionGateway = new ZodValidationPipe(
  createTransactionSchema,
);
