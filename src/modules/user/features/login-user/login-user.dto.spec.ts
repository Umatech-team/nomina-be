import { loginUserSchema } from './login-user.dto';

describe('LoginUserRequest DTO', () => {
  function makeValid(overrides: Record<string, unknown> = {}) {
    return { email: 'john@example.com', password: 'password123', ...overrides };
  }

  it('should accept a valid payload', () => {
    expect(loginUserSchema.safeParse(makeValid()).success).toBe(true);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ email: 'notanemail' }, 'invalid email'],
    [{ email: '' }, 'empty email'],
    [{ password: 'short' }, 'password shorter than 8 chars'],
    [{ password: '' }, 'empty password'],
    [{ email: undefined }, 'missing email'],
    [{ password: undefined }, 'missing password'],
  ])('should reject when %s', (invalidFields) => {
    expect(loginUserSchema.safeParse(makeValid(invalidFields)).success).toBe(
      false,
    );
  });

  it('should trim whitespace from email', () => {
    const result = loginUserSchema.safeParse(
      makeValid({ email: '  john@example.com  ' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('john@example.com');
  });
});
