import { UserRole } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateWorkspaceUserSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
  // workspaceUserId: z.string().uuid('ID do membro do workspace inválido'),
  role: z.nativeEnum(UserRole),
});

export const UpdateWorkspaceUserPipe = new ZodValidationPipe(
  updateWorkspaceUserSchema,
);
export type UpdateWorkspaceUserRequest = z.infer<
  typeof updateWorkspaceUserSchema
>;
