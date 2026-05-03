import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listWorkspacesSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Página deve ser no mínimo 1')
    .default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive('Tamanho da página deve ser um número positivo')
    .max(50, 'Tamanho da página muito grande')
    .default(20),
});

export const ListWorkspacesPipe = new ZodValidationPipe(listWorkspacesSchema);
export type ListWorkspacesRequest = z.infer<typeof listWorkspacesSchema>;
