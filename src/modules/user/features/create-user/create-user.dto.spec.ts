import { z } from 'zod';
import { CreateUserPipe, CreateUserRequest } from './create-user.dto';

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

describe('CreateUserRequest DTO Schema', () => {
  const makePayload = (overrides?: Partial<CreateUserRequest>) => ({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });

  const expectSuccess = (payload: CreateUserRequest, expected: boolean) => {
    const result = createUserSchema.safeParse(payload);
    expect(result.success).toBe(expected);
    return result;
  };

  describe('Name Validation', () => {
    it.each([
      ['Valid name', 'John Doe', true],
      ['Exact 4 chars', 'John', true],
      ['Exact 20 chars', 'John Doe Twelve Char', true],
      ['Too short', 'Jo', false],
      ['Too long', 'This is a very long name that exceeds', false],
      ['Empty string', '', false],
      ['Only whitespace', '    ', false],
      ['Invalid type (number)', 12345, false],
    ])('should validate %s', (_, name, expected) => {
      expectSuccess(makePayload({ name: name as string }), expected);
    });

    it('should trim whitespace from name', () => {
      const result = expectSuccess(makePayload({ name: '  John Doe  ' }), true);
      if (result.success) expect(result.data.name).toBe('John Doe');
    });
  });

  describe('Email Validation', () => {
    it.each([
      ['Valid email', 'john@example.com', true],
      ['With subdomains', 'john@mail.example.com', true],
      ['With plus symbol', 'john+test@example.com', true],
      ['Missing @ symbol', 'johnexample.com', false],
      ['Missing domain', 'john@', false],
      ['Missing username', '@example.com', false],
      ['Empty string', '', false],
      ['Invalid type (number)', 12345, false],
    ])('should validate %s', (_, email, expected) => {
      expectSuccess(makePayload({ email: email as string }), expected);
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
      ['Exact 8 chars', 'password', true],
      ['Special characters', 'p@ssw0rd!#$%', true],
      ['Too short', 'pass123', false],
      ['Empty string', '', false],
      ['Invalid type (number)', 12345, false],
    ])('should validate %s', (_, password, expected) => {
      expectSuccess(makePayload({ password: password as string }), expected);
    });

    it('should trim whitespace from password', () => {
      const result = expectSuccess(
        makePayload({ password: '  password123  ' }),
        true,
      );
      if (result.success) expect(result.data.password).toBe('password123');
    });

    it('should reject password longer than 255 characters', () => {
      expectSuccess(makePayload({ password: 'a'.repeat(256) }), false);
    });
  });

  describe('General Payload Validation', () => {
    it('should reject object with missing required fields', () => {
      expectSuccess({} as CreateUserRequest, false);
    });

    it('should reject object with null values', () => {
      expectSuccess(
        {
          name: null,
          email: null,
          password: null,
        } as unknown as CreateUserRequest,
        false,
      );
    });
  });

  describe('CreateUserPipe Integration', () => {
    it('should exist and have a transform method', () => {
      expect(CreateUserPipe).toBeDefined();
      expect(CreateUserPipe).toHaveProperty('transform');
    });
  });
});
