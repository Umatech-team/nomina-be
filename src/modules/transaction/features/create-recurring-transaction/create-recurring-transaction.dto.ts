import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createRecurringTransactionSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  categoryId: z.string().uuid('ID da categoria inválido'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  amount: z.coerce
    .bigint()
    .positive('Valor deve ser positivo')
    .max(9999999999n, 'Valor é muito grande'),
  frequency: z.nativeEnum(RecurrenceFrequency),
  type: z.nativeEnum(TransactionType),
  interval: z.coerce
    .number()
    .int()
    .positive('Intervalo deve ser um número positivo')
    .max(365, 'Intervalo deve ser no máximo 365'),
  startDate: z
    .string()
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return !Number.isNaN(date.getTime());
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
        return !Number.isNaN(date.getTime());
      },
      {
        message: 'Data de fim deve estar em um formato válido',
      },
    )
    .transform((dateString) => new Date(dateString))
    .optional()
    .nullable(),
  active: z.boolean().optional(),
});

export type CreateRecurringTransactionRequest = z.infer<
  typeof createRecurringTransactionSchema
>;
export const CreateRecurringTransactionPipe = new ZodValidationPipe(
  createRecurringTransactionSchema,
);
