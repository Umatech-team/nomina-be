import { RecurrenceFrequency } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateRecurringTransactionSchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido').nullable().optional(),
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Valor deve ser positivo').optional(),
  frequency: z.nativeEnum(RecurrenceFrequency).optional(),
  interval: z.coerce
    .number()
    .int()
    .positive('Intervalo deve ser um número positivo')
    .optional(),
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
    .transform((dateString) => new Date(dateString))
    .optional(),
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
    .nullable()
    .optional(),
  destinationAccountId: z
    .string()
    .uuid('ID da conta destino inválido')
    .nullable()
    .optional(),
});

export const UpdateRecurringTransactionPipe = new ZodValidationPipe(
  updateRecurringTransactionSchema,
);
export type UpdateRecurringTransactionRequest = z.infer<
  typeof updateRecurringTransactionSchema
>;
