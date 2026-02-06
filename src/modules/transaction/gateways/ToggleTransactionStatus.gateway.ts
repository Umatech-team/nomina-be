import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const toggleTransactionStatusSchema = z.object({
  id: z.string().uuid('ID da transação inválido'),
});

export const ToggleTransactionStatusGateway = new ZodValidationPipe(
  toggleTransactionStatusSchema,
);
