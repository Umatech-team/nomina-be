import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const setDefaultWorkspaceSchema = z.object({
  workspaceId: z
    .string({ required_error: 'workspaceId é obrigatório' })
    .uuid('workspaceId deve ser um UUID válido'),
});

export const SetDefaultWorkspacePipe = new ZodValidationPipe(
  setDefaultWorkspaceSchema,
);
export type SetDefaultWorkspaceRequest = z.infer<
  typeof setDefaultWorkspaceSchema
>;
