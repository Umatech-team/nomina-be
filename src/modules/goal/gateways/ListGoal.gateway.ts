import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const listdGoalSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
});

export const ListdGoalGateway = new ZodValidationPipe(listdGoalSchema);
