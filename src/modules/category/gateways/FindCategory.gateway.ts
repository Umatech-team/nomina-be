import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const findCategorySchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido'),
});

export const FindCategoryGateway = new ZodValidationPipe(findCategorySchema);
