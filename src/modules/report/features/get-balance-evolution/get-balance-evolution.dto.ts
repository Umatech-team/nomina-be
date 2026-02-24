import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

export const balanceEvolutionSchema = z.object({
  period: z.enum(['7d', '30d']),
});

export type BalanceEvolutionRequest = z.infer<typeof balanceEvolutionSchema>;

export const BalanceEvolutionPipe = new ZodValidationPipe(
  balanceEvolutionSchema,
);
