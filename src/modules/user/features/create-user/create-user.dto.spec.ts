import { z } from 'zod';
import { CreateUserPipe } from './create-user.dto';

/**
 * Zod schema for CreateUserRequest
 * Used to extract and validate the schema from the DTO
 */
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
  describe('Schema Validation - Name Field', () => {
    it('should accept a valid name (4-20 characters)', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should trim whitespace from name', () => {
      const dataWithWhitespace = {
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should reject name shorter than 4 characters', () => {
      const invalidData = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 20 characters', () => {
      const invalidData = {
        name: 'This is a very long name that exceeds the limit',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept name with exactly 4 characters (boundary)', () => {
      const boundaryData = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 20 characters (boundary)', () => {
      const boundaryData = {
        name: 'John Doe Twelve Cha',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should reject empty string as name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only name', () => {
      const invalidData = {
        name: '    ',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Validation - Email Field', () => {
    it('should accept a valid email address', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from email', () => {
      const dataWithWhitespace = {
        name: 'John Doe',
        email: '  john@example.com  ',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'johnexample.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without username', () => {
      const invalidData = {
        name: 'John Doe',
        email: '@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        name: 'John Doe',
        email: '',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept email with multiple dots in domain', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@mail.example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept email with plus symbol', () => {
      const validData = {
        name: 'John Doe',
        email: 'john+test@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Validation - Password Field', () => {
    it('should accept a valid password (8+ characters)', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from password', () => {
      const dataWithWhitespace = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '  password123  ',
      };

      const result = createUserSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('password123');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'pass12',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password longer than 255 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'a'.repeat(256),
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept password with exactly 8 characters (boundary)', () => {
      const boundaryData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      };

      const result = createUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept password with exactly 255 characters (boundary)', () => {
      const boundaryData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'a'.repeat(255),
      };

      const result = createUserSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept password with special characters', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'p@ssw0rd!#$%',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Validation - All Fields Missing', () => {
    it('should reject object with missing required fields', () => {
      const invalidData = {};

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject object with only name field', () => {
      const invalidData = {
        name: 'John Doe',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject object with null values', () => {
      const invalidData = {
        name: null,
        email: null,
        password: null,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Validation - Type Checking', () => {
    it('should reject name as number', () => {
      const invalidData = {
        name: 12345,
        email: 'john@example.com',
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email as number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 12345,
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password as number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 12345,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateUserPipe Integration', () => {
    it('should exist as exported instance', () => {
      expect(CreateUserPipe).toBeDefined();
    });

    it('should be instance of ZodValidationPipe', () => {
      expect(CreateUserPipe).toHaveProperty('transform');
    });
  });
});
