import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findGoalSchema = z.object({
  goalId: z.number(),
});

export const FindGoalGateway = new ZodValidationPipe(findGoalSchema);
