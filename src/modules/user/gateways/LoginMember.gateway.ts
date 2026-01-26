import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const loginMemberSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().trim().min(8).max(255),
});

export const LoginMemberGateway = new ZodValidationPipe(loginMemberSchema);
