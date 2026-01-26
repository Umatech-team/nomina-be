import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateMemberPassword = z.object({
  email: z.string().trim().email('E-mail inválido'),
  currentPassword: z
    .string()
    .trim()
    .min(6, 'Senha muito curta')
    .max(255, 'Senha muito longa'),
  newPassword: z
    .string()
    .trim()
    .min(6, 'Senha muito curta')
    .max(255, 'Senha muito longa'),
});

export const UpdateMemberPasswordGateway = new ZodValidationPipe(
  updateMemberPassword,
);
