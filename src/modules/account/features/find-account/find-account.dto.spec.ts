import { z } from 'zod';

const findAccountSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
});

describe('FindAccountRequest DTO', () => {
  describe('accountId field', () => {
    it('should accept a valid UUID v4', () => {
      const result = findAccountSchema.safeParse({
        accountId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should accept another valid UUID', () => {
      const result = findAccountSchema.safeParse({
        accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(result.success).toBe(true);
    });

    it('should reject a non-UUID plain string', () => {
      const result = findAccountSchema.safeParse({
        accountId: 'not-a-valid-id',
      });
      expect(result.success).toBe(false);
    });

    it('should reject an empty string', () => {
      const result = findAccountSchema.safeParse({ accountId: '' });
      expect(result.success).toBe(false);
    });

    it('should reject a numeric accountId', () => {
      const result = findAccountSchema.safeParse({ accountId: 42 });
      expect(result.success).toBe(false);
    });

    it('should reject missing accountId', () => {
      const result = findAccountSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
