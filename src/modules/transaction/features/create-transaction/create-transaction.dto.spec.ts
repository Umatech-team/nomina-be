import { TransactionStatus, TransactionType } from '@constants/enums';
import { z } from 'zod';

const createTransactionSchema = z
  .object({
    accountId: z.string().uuid('ID da conta inválido'),
    categoryId: z.string().uuid('ID da categoria inválido').nullish(),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional().nullable(),
    amount: z.coerce.bigint().positive('Valor deve ser positivo'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    type: z.nativeEnum(TransactionType),
    status: z.nativeEnum(TransactionStatus).optional(),
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
  );

describe('CreateTransactionRequest DTO', () => {
  function makeValid(overrides: Record<string, unknown> = {}) {
    return {
      accountId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Grocery',
      amount: 5000,
      date: '2024-01-15',
      type: TransactionType.EXPENSE,
      ...overrides,
    };
  }

  it('should accept a valid expense payload', () => {
    expect(createTransactionSchema.safeParse(makeValid()).success).toBe(true);
  });

  it('should coerce numeric amount to bigint', () => {
    const result = createTransactionSchema.safeParse(
      makeValid({ amount: 100 }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(typeof result.data.amount).toBe('bigint');
  });

  it.each<[Record<string, unknown>, string]>([
    [{ accountId: 'not-a-uuid' }, 'invalid accountId'],
    [{ title: '' }, 'empty title'],
    [{ amount: 0 }, 'zero amount'],
    [{ amount: -100 }, 'negative amount'],
    [{ date: '15-01-2024' }, 'wrong date format'],
    [{ date: '2024/01/15' }, 'date with slashes'],
    [{ type: 'INVALID' }, 'invalid type'],
  ])('should reject %s', (invalidFields, _label) => {
    expect(
      createTransactionSchema.safeParse(makeValid(invalidFields)).success,
    ).toBe(false);
  });

  it('should reject TRANSFER without destinationAccountId', () => {
    const result = createTransactionSchema.safeParse(
      makeValid({ type: TransactionType.TRANSFER }),
    );
    expect(result.success).toBe(false);
  });

  it('should accept TRANSFER with valid destinationAccountId', () => {
    const result = createTransactionSchema.safeParse(
      makeValid({
        type: TransactionType.TRANSFER,
        destinationAccountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      }),
    );
    expect(result.success).toBe(true);
  });
});
