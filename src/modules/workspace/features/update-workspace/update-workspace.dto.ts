import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  workspaceId: z
    .string({ required_error: 'workspaceId é obrigatório' })
    .uuid('workspaceId deve ser um UUID válido'),
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  currency: z
    .string()
    .trim()
    .length(3, 'Moeda deve ter 3 caracteres (ex: BRL)')
    .optional(),
});

export const UpdateWorkspacePipe = new ZodValidationPipe(updateWorkspaceSchema);
export type UpdateWorkspaceRequest = z.infer<typeof updateWorkspaceSchema>;
