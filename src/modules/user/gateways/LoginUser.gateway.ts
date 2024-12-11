import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const loginUserSchema = z.object({
  name: z.string().trim().min(4).max(20).max(255),
  password: z.string().trim().min(8).max(255),
});

export const LoginUserGateway = new ZodValidationPipe(loginUserSchema);
