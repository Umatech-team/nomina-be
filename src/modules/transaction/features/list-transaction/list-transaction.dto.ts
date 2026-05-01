import { TransactionStatus, TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listTransactionsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive('Página deve ser um número positivo')
    .default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido')
    .optional(),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  title: z.string().optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export type ListTransactionsRequest = z.infer<typeof listTransactionsSchema>;
export const ListTransactionsPipe = new ZodValidationPipe(
  listTransactionsSchema,
);
