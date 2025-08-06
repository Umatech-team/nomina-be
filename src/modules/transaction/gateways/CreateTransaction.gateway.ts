import { TransactionMethod, TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createTransactionSchema = z.object({
  title: z.string(),
  type: z.nativeEnum(TransactionType),
  method: z.nativeEnum(TransactionMethod),
  description: z.string().nullable(),
  category: z.string(),
  subCategory: z.string(),
  amount: z.number().positive(), // Aceita valor decimal, será convertido para centavos
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

export const CreateTransactionGateway = new ZodValidationPipe(
  createTransactionSchema,
);
