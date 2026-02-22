import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const acceptWorkspaceInviteSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
});

export const AcceptWorkspaceInviteGateway = new ZodValidationPipe(
  acceptWorkspaceInviteSchema,
);
