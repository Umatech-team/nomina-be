import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const removeWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
  userId: z.string().uuid('ID do usuário inválido'),
});

export const RemoveWorkspacePipe = new ZodValidationPipe(removeWorkspaceSchema);
export type RemoveWorkspaceRequest = z.infer<typeof removeWorkspaceSchema>;
