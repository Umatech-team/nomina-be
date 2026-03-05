import { LoginUserPipe, loginUserSchema } from './login-user.dto';

describe('LoginUserRequest DTO Schema', () => {
  const makePayload = (
    overrides?: Partial<Parameters<typeof loginUserSchema.parse>[0]>,
  ) => ({
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });
  const expectSuccess = (
    payload: Parameters<typeof loginUserSchema.parse>[0],
    expected: boolean,
  ) => {
    const result = loginUserSchema.safeParse(payload);
    expect(result.success).toBe(expected);
    return result;
  };

  describe('Email Validation', () => {
    it.each([
      ['Valid email', 'john@example.com', true],
      ['With subdomains', 'user@mail.example.co.uk', true],
      ['With plus addressing', 'john+tag@example.com', true],
      ['Missing @ symbol', 'johnexample.com', false],
      ['Missing domain', 'john@', false],
      ['Empty string', '', false],
      ['With spaces', 'john doe@example.com', false],
      ['Invalid type (number)', 12345, false],
      ['Invalid type (object)', { value: 'john@example.com' }, false],
    ])('should validate %s', (_, email, expected) => {
      expectSuccess(
        makePayload({ email: email as unknown as string }),
        expected,
      );
    });

    it('should trim whitespace from email', () => {
      const result = expectSuccess(
        makePayload({ email: '  john@example.com  ' }),
        true,
      );
      if (result.success) expect(result.data.email).toBe('john@example.com');
    });
  });

  describe('Password Validation', () => {
    it.each([
      ['Valid password', 'password123', true],
      ['Exact 8 chars (boundary)', 'password', true],
      ['Exact 255 chars (boundary)', 'a'.repeat(255), true],
      ['With special characters', 'p@ssw0rd!#$%^&*()', true],
      ['With numbers and uppercase', 'Password123', true],
      ['Too short (< 8 chars)', 'pass12', false],
      ['Too long (> 255 chars)', 'a'.repeat(256), false],
      ['Empty string', '', false],
      ['Invalid type (number)', 12345, false],
      ['Invalid type (object)', { value: 'password123' }, false],
    ])('should validate %s', (_, password, expected) => {
      expectSuccess(
        makePayload({ password: password as unknown as string }),
        expected,
      );
    });

    it('should trim whitespace from password', () => {
      const result = expectSuccess(
        makePayload({ password: '  password123  ' }),
        true,
      );
      if (result.success) expect(result.data.password).toBe('password123');
    });
  });

  describe('General Payload Validation', () => {
    it.each([
      ['Missing all fields', {}, false],
      ['Only email present', { email: 'john@example.com' }, false],
      ['Only password present', { password: 'password123' }, false],
      ['Null values', { email: null, password: null }, false],
    ])('should reject object with %s', (_, invalidPayload, expected) => {
      expectSuccess(invalidPayload, expected);
    });
  });

  describe('LoginUserPipe Integration', () => {
    it('should exist and have a transform method', () => {
      expect(LoginUserPipe).toBeDefined();
      expect(LoginUserPipe).toHaveProperty('transform');
    });
  });
});
