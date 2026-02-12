import { TransactionStatus, TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateTransaction = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  categoryId: z.string().uuid('ID da categoria inválido').optional().nullable(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z
    .string()
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      },
      {
        message: 'Data deve estar em um formato válido',
      },
    )
    .transform((dateString) => new Date(dateString)),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
});

export const UpdateTransactionGateway = new ZodValidationPipe(
  updateTransaction,
);
