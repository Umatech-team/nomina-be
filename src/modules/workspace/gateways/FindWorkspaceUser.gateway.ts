import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findWorkspaceUserSchema = z.object({
  workspaceUserId: z.string().uuid('ID do membro do workspace inválido'),
});

export const FindWorkspaceUserGateway = new ZodValidationPipe(findWorkspaceUserSchema);
