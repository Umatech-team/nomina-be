import { AccountType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
  type: z.nativeEnum(AccountType),
  closingDay: z.number().int().min(1).max(31).nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  creditLimit: z.coerce
    .number()
    .positive('Limite deve ser positivo')
    .optional()
    .nullable(),
});

export const UpdateAccountPipe = new ZodValidationPipe(updateAccountSchema);
export type UpdateAccountRequest = z.infer<typeof updateAccountSchema>;
