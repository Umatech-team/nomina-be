import { MemberRole } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateWorkspaceUserSchema = z.object({
  workspaceUserId: z.string().uuid('ID do membro do workspace inválido'),
  role: z.nativeEnum(MemberRole),
});

export const UpdateWorkspaceUserGateway = new ZodValidationPipe(updateWorkspaceUserSchema);
