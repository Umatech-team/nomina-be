import { UserRole } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateWorkspaceUserSchema = z.object({
  workspaceUserId: z.string().uuid('ID do membro do workspace inválido'),
  role: z.nativeEnum(UserRole),
});

export const UpdateWorkspaceUserGateway = new ZodValidationPipe(updateWorkspaceUserSchema);
