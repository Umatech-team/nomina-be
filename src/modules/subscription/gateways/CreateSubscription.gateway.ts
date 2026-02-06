import { SubscriptionStatus } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório'),
  status: z.nativeEnum(SubscriptionStatus).optional(),
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

export const CreateSubscriptionGateway = new ZodValidationPipe(
  createSubscriptionSchema,
);
