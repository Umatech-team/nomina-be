import { TransactionType } from '@constants/enums';
import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  icon: z.string().trim().optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)')
    .optional()
    .nullable(),
  type: z
    .nativeEnum(TransactionType)
    .refine((val) => val !== TransactionType.TRANSFER, {
      message: 'Categorias não podem ser do tipo TRANSFER',
    }),
  parentId: z
    .string()
    .uuid('ID da categoria pai inválido')
    .optional()
    .nullable(),
});

export const CreateCategoryGateway = new ZodValidationPipe(
  createCategorySchema,
);
