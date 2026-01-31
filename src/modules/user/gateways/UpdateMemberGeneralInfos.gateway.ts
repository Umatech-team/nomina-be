import { ZodValidationPipe } from '@shared/pipes/ZodValidation';
import { z } from 'zod';

const updateUserGeneralInfos = z.object({
  name: z
    .string()
    .trim()
    .min(4, 'Nome muito curto')
    .max(20, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido'),
  phone: z.string().trim().optional(),
});

export const UpdateUserGeneralInfosGateway = new ZodValidationPipe(
  updateUserGeneralInfos,
);
