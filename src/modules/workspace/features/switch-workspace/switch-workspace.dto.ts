import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const switchWorkspaceSchema = z.object({
  workspaceId: z
    .string({ required_error: 'workspaceId é obrigatório' })
    .uuid('workspaceId deve ser um UUID válido'),
});

export const SwitchWorkspacePipe = new ZodValidationPipe(switchWorkspaceSchema);
export type SwitchWorkspaceRequest = z.infer<typeof switchWorkspaceSchema>;
