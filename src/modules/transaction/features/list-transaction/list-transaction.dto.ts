import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive('Página deve ser um número positivo'),
  pageSize: z.coerce
    .number()
    .int()
    .positive('Tamanho da página deve ser um número positivo')
    .max(100, 'Tamanho da página muito grande'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
});

export const ListTransactionsPipe = new ZodValidationPipe(
  listTransactionsSchema,
);
export type ListTransactionsRequest = z.infer<typeof listTransactionsSchema>;
