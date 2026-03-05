import { AccountType } from '@constants/enums';
import { z } from 'zod';

/**
 * Mirror of the createAccountSchema defined in create-account.dto.ts
 */
const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  type: z.nativeEnum(AccountType),
  icon: z.string().trim().optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)')
    .optional()
    .nullable(),
  closingDay: z.number().int().min(1).max(31).optional().nullable(),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
});

const validBase = {
  name: 'My Account',
  type: AccountType.CHECKING,
};

describe('CreateAccountRequest DTO', () => {
  describe('name field', () => {
    it('should accept a valid name', () => {
      const result = createAccountSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it('should accept minimum length name (1 character)', () => {
      const result = createAccountSchema.safeParse({ ...validBase, name: 'A' });
      expect(result.success).toBe(true);
    });

    it('should accept maximum length name (100 characters)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        name: 'A'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createAccountSchema.safeParse({ ...validBase, name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        name: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        name: '  My Account  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('My Account');
      }
    });
  });

  describe('type field', () => {
    it.each(Object.values(AccountType))(
      'should accept AccountType.%s',
      (type) => {
        const result = createAccountSchema.safeParse({ ...validBase, type });
        expect(result.success).toBe(true);
      },
    );

    it('should reject invalid type value', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        type: 'SAVINGS',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const { type: _, ...withoutType } = validBase;
      const result = createAccountSchema.safeParse(withoutType);
      expect(result.success).toBe(false);
    });
  });

  describe('icon field (optional)', () => {
    it('should accept a valid icon string', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        icon: 'bank',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null icon', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        icon: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept when icon is omitted', () => {
      const result = createAccountSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });
  });

  describe('color field (optional)', () => {
    it('should accept a valid hex color (#RRGGBB)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: '#1A2B3C',
      });
      expect(result.success).toBe(true);
    });

    it('should accept lowercase hex color', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: '#aabbcc',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null color', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject color without # prefix', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: '1A2B3C',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short hex color (3 digits)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: '#ABC',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid hex characters', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        color: '#GGHHII',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('closingDay field (optional)', () => {
    it('should accept day 1 (minimum boundary)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should accept day 31 (maximum boundary)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: 31,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null closingDay', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject day 0', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject day 32', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: 32,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer closingDay', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        closingDay: 5.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('dueDay field (optional)', () => {
    it('should accept day 15 (valid mid-range)', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        dueDay: 15,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null dueDay', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        dueDay: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject day 0', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        dueDay: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject day 32', () => {
      const result = createAccountSchema.safeParse({
        ...validBase,
        dueDay: 32,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('full valid payload', () => {
    it('should accept a complete valid payload', () => {
      const result = createAccountSchema.safeParse({
        name: 'Credit Card',
        type: AccountType.CREDIT_CARD,
        icon: 'credit',
        color: '#FF5733',
        closingDay: 5,
        dueDay: 12,
      });
      expect(result.success).toBe(true);
    });
  });
});
