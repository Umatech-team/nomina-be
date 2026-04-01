import { AccountType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nome é obrigatório')
      .max(100, 'Nome muito longo'),
    type: z.nativeEnum(AccountType),
    icon: z.string().trim().optional().nullable(),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)')
      .optional()
      .nullable(),
    closingDay: z.number().int().min(1).max(31).optional().nullable(),
    dueDay: z.number().int().min(1).max(31).optional().nullable(),
    creditLimit: z.coerce
      .number()
      .positive('Limite deve ser positivo')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.type === AccountType.CREDIT_CARD) {
        return data.closingDay != null && data.dueDay != null;
      }
      return true;
    },
    {
      message:
        'Dia de fechamento e vencimento são obrigatórios para cartão de crédito',
      path: ['closingDay'],
    },
  );

export const CreateAccountPipe = new ZodValidationPipe(createAccountSchema);
export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
