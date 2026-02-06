import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findAccountSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
});

export const FindAccountGateway = new ZodValidationPipe(findAccountSchema);
