import { TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateTransaction = z.object({
  transactionId: z.number(),
  title: z.string(),
  type: z.nativeEnum(TransactionType),
  description: z.string().nullable(),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z
    .string()
    .refine(
      (dateString) => {
        // Valida se a string pode ser convertida para uma data válida
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      },
      {
        message: 'Data deve estar em um formato válido',
      },
    )
    .transform((dateString) => {
      // Converte a string para Date
      return new Date(dateString);
    }),
});

export const UpdateTransactionGateway = new ZodValidationPipe(
  updateTransaction,
);
