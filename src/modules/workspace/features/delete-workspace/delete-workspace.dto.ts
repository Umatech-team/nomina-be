import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const deleteWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
});

export const DeleteWorkspaceGateway = new ZodValidationPipe(
  deleteWorkspaceSchema,
);
export type DeleteWorkspaceRequest = z.infer<typeof deleteWorkspaceSchema>;
