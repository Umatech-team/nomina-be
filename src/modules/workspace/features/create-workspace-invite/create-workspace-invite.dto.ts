import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createWorkspaceInviteSchema = z.object({
  role: z.string().min(1, 'Função é obrigatória'),
});

export const CreateWorkspaceInvitePipe = new ZodValidationPipe(
  createWorkspaceInviteSchema,
);
export type CreateWorkspaceInviteRequest = z.infer<
  typeof createWorkspaceInviteSchema
>;
