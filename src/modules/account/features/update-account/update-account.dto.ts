import { AccountType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateAccountSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
  type: z.nativeEnum(AccountType),
  icon: z.string().trim().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color (use format #RRGGBB)')
    .nullable(),
  closingDay: z.number().int().min(1).max(31).nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  creditLimit: z.coerce.number().positive('Limite deve ser positivo').optional().nullable(),
});

export const UpdateAccountPipe = new ZodValidationPipe(updateAccountSchema);
export type UpdateAccountRequest = z.infer<typeof updateAccountSchema>;
