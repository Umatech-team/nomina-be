import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const getCreditCardInvoiceSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

export type GetCreditCardInvoiceRequest = z.infer<
  typeof getCreditCardInvoiceSchema
>;
export const GetCreditCardInvoicePipe = new ZodValidationPipe(
  getCreditCardInvoiceSchema,
);
