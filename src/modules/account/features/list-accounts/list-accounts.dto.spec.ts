import { z } from 'zod';

const listAccountsSchema = z.object({
  page: z.coerce.number().int().positive('Página deve ser um número positivo'),
  pageSize: z.coerce
    .number()
    .int()
    .positive('Tamanho da página deve ser um número positivo')
    .max(50, 'Tamanho da página muito grande'),
});

describe('ListAccountsRequest DTO', () => {
  describe('page field', () => {
    it('should accept page=1 (minimum positive)', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 10 });
      expect(result.success).toBe(true);
    });

    it('should accept large page numbers', () => {
      const result = listAccountsSchema.safeParse({
        page: 999,
        pageSize: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should coerce string "1" to number 1', () => {
      const result = listAccountsSchema.safeParse({ page: '1', pageSize: 10 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should coerce string "5" to number 5', () => {
      const result = listAccountsSchema.safeParse({
        page: '5',
        pageSize: 10,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
      }
    });

    it('should reject page=0 (not positive)', () => {
      const result = listAccountsSchema.safeParse({ page: 0, pageSize: 10 });
      expect(result.success).toBe(false);
    });

    it('should reject negative page', () => {
      const result = listAccountsSchema.safeParse({ page: -1, pageSize: 10 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer page (float)', () => {
      const result = listAccountsSchema.safeParse({
        page: 1.5,
        pageSize: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing page', () => {
      const result = listAccountsSchema.safeParse({ pageSize: 10 });
      expect(result.success).toBe(false);
    });
  });

  describe('pageSize field', () => {
    it('should accept pageSize=1 (minimum positive)', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 1 });
      expect(result.success).toBe(true);
    });

    it('should accept pageSize=50 (maximum boundary)', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 50 });
      expect(result.success).toBe(true);
    });

    it('should reject pageSize=51 (exceeds maximum)', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 51 });
      expect(result.success).toBe(false);
    });

    it('should reject pageSize=0 (not positive)', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative pageSize', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: -5 });
      expect(result.success).toBe(false);
    });

    it('should coerce string "20" to number 20', () => {
      const result = listAccountsSchema.safeParse({
        page: 1,
        pageSize: '20',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should reject non-integer pageSize', () => {
      const result = listAccountsSchema.safeParse({
        page: 1,
        pageSize: 10.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing pageSize', () => {
      const result = listAccountsSchema.safeParse({ page: 1 });
      expect(result.success).toBe(false);
    });
  });

  describe('full valid payload', () => {
    it('should accept page=1 and pageSize=25', () => {
      const result = listAccountsSchema.safeParse({ page: 1, pageSize: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, pageSize: 25 });
      }
    });
  });
});
