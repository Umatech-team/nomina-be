import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const loginUserSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().trim().min(8).max(255),
});

export const LoginUserGateway = new ZodValidationPipe(loginUserSchema);
