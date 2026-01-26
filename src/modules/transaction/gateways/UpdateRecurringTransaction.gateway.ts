import { RecurrenceFrequency } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateRecurringTransactionSchema = z.object({
  recurringTransactionId: z
    .string()
    .uuid('ID da transação recorrente inválido'),
  accountId: z.string().uuid('ID da conta inválido'),
  categoryId: z.string().uuid('ID da categoria inválido').nullable(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().positive('Intervalo deve ser um número positivo'),
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
    .transform((dateString) => new Date(dateString)),
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
    .nullable(),
  active: z.boolean(),
});

export const UpdateRecurringTransactionGateway = new ZodValidationPipe(
  updateRecurringTransactionSchema,
);
