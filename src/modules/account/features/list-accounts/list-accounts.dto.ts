import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listAccountsSchema = z.object({
  page: z.coerce.number().int().positive('Página deve ser um número positivo'),
  pageSize: z.coerce
    .number()
    .int()
    .positive('Tamanho da página deve ser um número positivo')
    .max(50, 'Tamanho da página muito grande'),
});

export const ListAccountsPipe = new ZodValidationPipe(listAccountsSchema);
export type ListAccountsRequest = z.infer<typeof listAccountsSchema>;
