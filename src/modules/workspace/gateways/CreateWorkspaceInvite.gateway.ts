import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createWorkspaceInviteSchema = z.object({
  workspaceId: z.string().uuid(),
  role: z.string().min(1, 'Função é obrigatória'),
});

export const CreateWorkspaceInviteGateway = new ZodValidationPipe(
  createWorkspaceInviteSchema,
);
