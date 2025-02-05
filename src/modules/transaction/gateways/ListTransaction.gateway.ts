import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listTransactionsSchema = z.object({
  page: z.number(),
  pageSIze: z.number(),
  startDate: z.date(),
  endDate: z.date(),
});

export const ListTransactionsGateway = new ZodValidationPipe(
  listTransactionsSchema,
);
