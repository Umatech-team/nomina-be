import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const cashFlowEvolutionSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GetCashFlowEvolutionGateway = new ZodValidationPipe(
  cashFlowEvolutionSchema,
);
