import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const expensesByCategorySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const GetExpensesByCategoryGateway = new ZodValidationPipe(
  expensesByCategorySchema,
);
