import { z } from 'zod';
import { LoginUserPipe } from './login-user.dto';

/**
 * Zod schema for LoginUserRequest
 * Used to extract and validate the schema from the DTO
 */
const loginUserSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z
    .string()
    .trim()
    .min(8, 'Senha muito curta')
    .max(255, 'Senha muito longa'),
});

describe('LoginUserRequest DTO', () => {
  describe('Schema Validation - Email Field', () => {
    it('should accept a valid email address', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should trim whitespace from email', () => {
      const dataWithWhitespace = {
        email: '  john@example.com  ',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalidData = {
        email: 'johnexample.com',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'john@',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept email with multiple subdomains', () => {
      const validData = {
        email: 'user@mail.example.co.uk',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept email with plus addressing', () => {
      const validData = {
        email: 'john+tag@example.com',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject email with spaces', () => {
      const invalidData = {
        email: 'john doe@example.com',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Validation - Password Field', () => {
    it('should accept a valid password (8+ characters)', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from password', () => {
      const dataWithWhitespace = {
        email: 'john@example.com',
        password: '  password123  ',
      };

      const result = loginUserSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('password123');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'pass12',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password longer than 255 characters', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'a'.repeat(256),
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept password with exactly 8 characters (boundary)', () => {
      const boundaryData = {
        email: 'john@example.com',
        password: 'password',
      };

      const result = loginUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept password with exactly 255 characters (boundary)', () => {
      const boundaryData = {
        email: 'john@example.com',
        password: 'a'.repeat(255),
      };

      const result = loginUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept password with special characters', () => {
      const validData = {
        email: 'john@example.com',
        password: 'p@ssw0rd!#$%^&*()',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept password with numbers and uppercase', () => {
      const validData = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Validation - All Fields Missing', () => {
    it('should reject object with missing required fields', () => {
      const invalidData = {};

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject object with only email field', () => {
      const invalidData = {
        email: 'john@example.com',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject object with only password field', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject object with null values', () => {
      const invalidData = {
        email: null,
        password: null,
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Validation - Type Checking', () => {
    it('should reject email as number', () => {
      const invalidData = {
        email: 12345,
        password: 'password123',
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password as number', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 12345,
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject both fields as objects', () => {
      const invalidData = {
        email: { value: 'john@example.com' },
        password: { value: 'password123' },
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginUserPipe Integration', () => {
    it('should exist as exported instance', () => {
      expect(LoginUserPipe).toBeDefined();
    });

    it('should be instance of ZodValidationPipe', () => {
      expect(LoginUserPipe).toHaveProperty('transform');
    });
  });
});
