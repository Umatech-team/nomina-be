import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateGoal = z.object({
  goalId: z.number(),
  title: z.string(),
  currentAmount: z.number(),
  monthlyContribution: z.number(),
  targetAmount: z.number(),
});

export const UpdateGoalGateway = new ZodValidationPipe(updateGoal);
