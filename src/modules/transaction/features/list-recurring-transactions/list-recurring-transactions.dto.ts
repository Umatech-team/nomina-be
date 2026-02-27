import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listRecurringTransactionsSchema = z.object({
  page: z.coerce.number().int().positive('Página deve ser um número positivo'),
  pageSize: z.coerce
    .number()
    .int()
    .positive('Tamanho da página deve ser um número positivo')
    .max(50, 'Tamanho da página muito grande'),
  activeOnly: z.boolean().optional(),
});

export const ListRecurringTransactionsPipe = new ZodValidationPipe(
  listRecurringTransactionsSchema,
);
export type ListRecurringTransactionsRequest = z.infer<
  typeof listRecurringTransactionsSchema
>;
