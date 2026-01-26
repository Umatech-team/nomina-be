import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
});

export const FindWorkspaceGateway = new ZodValidationPipe(findWorkspaceSchema);
