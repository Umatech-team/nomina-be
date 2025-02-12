import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listTransactionsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const ListTransactionsGateway = new ZodValidationPipe(
  listTransactionsSchema,
);
