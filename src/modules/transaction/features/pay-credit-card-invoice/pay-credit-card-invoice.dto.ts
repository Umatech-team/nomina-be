import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const payCreditCardInvoiceSchema = z.object({
  sourceAccountId: z.string().uuid('ID da conta origem inválido'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid('ID da categoria inválido').optional().nullable(),
});

export type PayCreditCardInvoiceRequest = z.infer<
  typeof payCreditCardInvoiceSchema
>;
export const PayCreditCardInvoicePipe = new ZodValidationPipe(
  payCreditCardInvoiceSchema,
);
