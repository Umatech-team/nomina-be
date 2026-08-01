import { z } from 'zod';

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, 'Nome muito curto')
    .max(20, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido'),
  password: z
    .string()
    .trim()
    .min(8, 'Senha muito curta')
    .max(255, 'Senha muito longa'),
});

describe('CreateUserRequest DTO', () => {
  function makeValid(overrides: Record<string, unknown> = {}) {
    return {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      ...overrides,
    };
  }

  it('should accept a valid payload', () => {
    expect(createUserSchema.safeParse(makeValid()).success).toBe(true);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ name: 'Jon' }, 'name shorter than 4 chars'],
    [{ name: 'A'.repeat(21) }, 'name longer than 20 chars'],
    [{ name: '' }, 'empty name'],
    [{ email: 'notanemail' }, 'invalid email'],
    [{ email: '' }, 'empty email'],
    [{ password: 'short' }, 'password shorter than 8 chars'],
    [{ password: 'x'.repeat(256) }, 'password longer than 255 chars'],
    [{ password: '' }, 'empty password'],
  ])('should reject when %s', (invalidFields) => {
    expect(createUserSchema.safeParse(makeValid(invalidFields)).success).toBe(
      false,
    );
  });

  it('should trim whitespace from name', () => {
    const result = createUserSchema.safeParse(makeValid({ name: '  John  ' }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('John');
  });
});
