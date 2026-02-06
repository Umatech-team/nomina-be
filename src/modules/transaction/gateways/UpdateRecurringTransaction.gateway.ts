import { RecurrenceFrequency } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateRecurringTransactionSchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido').nullable().optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  amount: z.number().positive('Valor deve ser positivo').optional(),
  frequency: z.nativeEnum(RecurrenceFrequency).optional(),
  interval: z
    .number()
    .int()
    .positive('Intervalo deve ser um número positivo')
    .optional(),
  startDate: z
    .string()
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      },
      {
        message: 'Data de início deve estar em um formato válido',
      },
    )
    .transform((dateString) => new Date(dateString))
    .optional(),
  endDate: z
    .string()
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      },
      {
        message: 'Data de fim deve estar em um formato válido',
      },
    )
    .transform((dateString) => new Date(dateString))
    .nullable()
    .optional(),
});

export const UpdateRecurringTransactionGateway = new ZodValidationPipe(
  updateRecurringTransactionSchema,
);
