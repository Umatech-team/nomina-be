import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  currency: z
    .string()
    .trim()
    .length(3, 'Moeda deve ter 3 caracteres (ex: BRL)'),
});

export const UpdateWorkspaceGateway = new ZodValidationPipe(
  updateWorkspaceSchema,
);
