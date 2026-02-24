import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, 'Nome muito curto')
    .max(20, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido'),
  password: z
    .string()
    .trim()
    .min(8, 'Senha muito curta')
    .max(255, 'Senha muito longa'),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export const CreateUserPipe = new ZodValidationPipe(createUserSchema);
