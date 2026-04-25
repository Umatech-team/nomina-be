import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  creditLimit: z.coerce
    .number()
    .positive('Limite deve ser positivo')
    .optional(),
});

export const UpdateAccountPipe = new ZodValidationPipe(updateAccountSchema);
export type UpdateAccountRequest = z.infer<typeof updateAccountSchema>;
