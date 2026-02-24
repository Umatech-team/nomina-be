import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

export const cashFlowEvolutionSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
});

export type CashFlowEvolutionRequest = z.infer<typeof cashFlowEvolutionSchema>;

export const CashFlowEvolutionPipe = new ZodValidationPipe(
  cashFlowEvolutionSchema,
);
