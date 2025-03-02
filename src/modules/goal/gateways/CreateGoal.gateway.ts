import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string(),
  currentAmount: z.number(),
  monthlyContribution: z.number(),
  targetAmount: z.number(),
});

export const CreateGoalGateway = new ZodValidationPipe(createGoalSchema);
