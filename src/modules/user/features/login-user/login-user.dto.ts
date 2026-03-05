import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().trim().min(8).max(255),
});

export type LoginUserRequest = z.infer<typeof loginUserSchema>;
export const LoginUserPipe = new ZodValidationPipe(loginUserSchema);
