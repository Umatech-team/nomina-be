import { TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateCategorySchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido'),
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  icon: z.string().trim().nullable(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)').nullable(),
  type: z.nativeEnum(TransactionType).refine((val) => val !== TransactionType.TRANSFER, {
    message: 'Categorias não podem ser do tipo TRANSFER',
  }),
  parentId: z.string().uuid('ID da categoria pai inválido').nullable(),
});

export const UpdateCategoryGateway = new ZodValidationPipe(updateCategorySchema);
