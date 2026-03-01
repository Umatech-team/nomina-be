import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
});

export const DeleteAccountPipe = new ZodValidationPipe(deleteAccountSchema);
export type DeleteAccountRequest = z.infer<typeof deleteAccountSchema>;
