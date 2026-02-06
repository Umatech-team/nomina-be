import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('ID da assinatura inválido'),
});

export const FindSubscriptionGateway = new ZodValidationPipe(
  findSubscriptionSchema,
);
