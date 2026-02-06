import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  currency: z
    .string()
    .trim()
    .length(3, 'Moeda deve ter 3 caracteres (ex: BRL)')
    .optional(),
  isDefault: z.boolean(),
});

export const CreateWorkspaceGateway = new ZodValidationPipe(
  createWorkspaceSchema,
);
