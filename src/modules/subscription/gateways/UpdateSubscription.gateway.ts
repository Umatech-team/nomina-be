import { SubscriptionStatus } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('ID da assinatura inválido'),
  planId: z.string().min(1, 'ID do plano é obrigatório'),
  status: z.nativeEnum(SubscriptionStatus),
  currentPeriodEnd: z
    .string()
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      },
      {
        message: 'Data de fim do período deve estar em um formato válido',
      },
    )
    .transform((dateString) => new Date(dateString)),
});

export const UpdateSubscriptionGateway = new ZodValidationPipe(
  updateSubscriptionSchema,
);
