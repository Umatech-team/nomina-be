import { z } from 'zod';

const deleteAccountSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
});

describe('DeleteAccountRequest DTO', () => {
  describe('accountId field', () => {
    it('should accept a valid UUID v4', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should accept a different valid UUID', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(result.success).toBe(true);
    });

    it('should reject a plain string (non-UUID)', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject an integer accountId', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: 123,
      });
      expect(result.success).toBe(false);
    });

    it('should reject an empty string', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing accountId', () => {
      const result = deleteAccountSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject a UUID with wrong format (truncated)', () => {
      const result = deleteAccountSchema.safeParse({
        accountId: '123e4567-e89b-12d3-a456',
      });
      expect(result.success).toBe(false);
    });
  });
});
