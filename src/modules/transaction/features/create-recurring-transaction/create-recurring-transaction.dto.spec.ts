import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { z } from 'zod';

const createRecurringTransactionSchema = z
  .object({
    accountId: z.string().uuid('ID da conta inválido'),
    categoryId: z
      .string()
      .uuid('ID da categoria inválido')
      .optional()
      .nullable(),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional().nullable(),
    amount: z.coerce.bigint().positive('Valor deve ser positivo').optional(),
    totalAmount: z.coerce
      .bigint()
      .positive('Valor total deve ser positivo')
      .optional(),
    installments: z.coerce
      .number()
      .int()
      .positive('Número de parcelas deve ser positivo')
      .max(365)
      .optional(),
    frequency: z.nativeEnum(RecurrenceFrequency),
    type: z.nativeEnum(TransactionType),
    interval: z.coerce
      .number()
      .int()
      .positive('Intervalo deve ser um número positivo')
      .max(365),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD')
      .optional()
      .nullable(),
    active: z.boolean().optional(),
    destinationAccountId: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) =>
      data.type === TransactionType.TRANSFER
        ? !!data.destinationAccountId
        : true,
    {
      message: 'Conta destino é obrigatória para transferências',
      path: ['destinationAccountId'],
    },
  )
  .refine(
    (data) =>
      data.amount !== undefined ||
      (data.totalAmount !== undefined && data.installments !== undefined),
    {
      message: 'Informe amount ou totalAmount + installments',
      path: ['amount'],
    },
  )
  .refine(
    (data) =>
      !(
        data.amount !== undefined &&
        (data.totalAmount !== undefined || data.installments !== undefined)
      ),
    {
      message:
        'Não é possível informar amount junto com totalAmount/installments',
      path: ['amount'],
    },
  )
  .refine(
    (data) =>
      (data.totalAmount !== undefined) === (data.installments !== undefined),
    {
      message: 'totalAmount e installments devem ser informados juntos',
      path: ['installments'],
    },
  );

describe('CreateRecurringTransactionRequest DTO', () => {
  function makeValid(overrides: Record<string, unknown> = {}) {
    return {
      accountId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Aluguel',
      amount: 150000,
      frequency: RecurrenceFrequency.MONTHLY,
      type: TransactionType.EXPENSE,
      interval: 1,
      startDate: '2024-01-01',
      ...overrides,
    };
  }

  it('should accept the classic single-amount payload', () => {
    expect(
      createRecurringTransactionSchema.safeParse(makeValid()).success,
    ).toBe(true);
  });

  it('should accept a totalAmount + installments payload without amount', () => {
    const result = createRecurringTransactionSchema.safeParse(
      makeValid({ amount: undefined, totalAmount: 300000, installments: 3 }),
    );
    expect(result.success).toBe(true);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ amount: undefined }, 'neither amount nor totalAmount/installments'],
    [
      { totalAmount: 300000, installments: undefined },
      'totalAmount without installments',
    ],
    [
      { amount: undefined, installments: 3 },
      'installments without totalAmount',
    ],
    [
      { totalAmount: 300000, installments: 3 },
      'amount together with totalAmount + installments',
    ],
    [{ totalAmount: 0, installments: 3 }, 'zero totalAmount'],
    [{ totalAmount: 300000, installments: 0 }, 'zero installments'],
  ])('should reject %s', (overrides) => {
    expect(
      createRecurringTransactionSchema.safeParse(makeValid(overrides)).success,
    ).toBe(false);
  });
});
