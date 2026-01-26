import { MemberRole } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createWorkspaceUserSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
  userId: z.string().uuid('ID do usuário inválido'),
  role: z.nativeEnum(MemberRole),
});

export const CreateWorkspaceUserGateway = new ZodValidationPipe(
  createWorkspaceUserSchema,
);
