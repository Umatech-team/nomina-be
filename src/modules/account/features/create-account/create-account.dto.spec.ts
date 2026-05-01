import { AccountType } from '@constants/enums';
import { createAccountSchema } from './create-account.dto';

describe('CreateAccountRequest DTO', () => {
  describe('CHECKING account', () => {
    it('should accept a valid CHECKING payload', () => {
      const result = createAccountSchema.safeParse({
        type: AccountType.CHECKING,
        name: 'Conta',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      expect(
        createAccountSchema.safeParse({ type: AccountType.CHECKING }).success,
      ).toBe(false);
    });

    it('should reject empty name', () => {
      expect(
        createAccountSchema.safeParse({ type: AccountType.CHECKING, name: '' })
          .success,
      ).toBe(false);
    });

    it('should default balance to 0 when not provided', () => {
      const result = createAccountSchema.safeParse({
        type: AccountType.CHECKING,
        name: 'C',
      });
      expect(result.success).toBe(true);
      if (result.success && 'balance' in result.data)
        expect(result.data.balance).toBe(0);
    });
  });

  describe('CASH account', () => {
    it('should accept a valid CASH payload', () => {
      expect(
        createAccountSchema.safeParse({
          type: AccountType.CASH,
          name: 'Carteira',
        }).success,
      ).toBe(true);
    });

    it('should default balance to 0 when not provided', () => {
      const result = createAccountSchema.safeParse({
        type: AccountType.CASH,
        name: 'Carteira',
      });
      if (result.success && 'balance' in result.data)
        expect(result.data.balance).toBe(0);
    });
  });

  describe('CREDIT_CARD account', () => {
    function makeCC(overrides: Record<string, unknown> = {}) {
      return {
        type: AccountType.CREDIT_CARD,
        name: 'Visa',
        creditLimit: 5000,
        closingDay: 10,
        dueDay: 20,
        ...overrides,
      };
    }

    it('should accept a valid CREDIT_CARD payload', () => {
      expect(createAccountSchema.safeParse(makeCC()).success).toBe(true);
    });

    it.each<[Record<string, unknown>, string]>([
      [{ creditLimit: -1 }, 'negative creditLimit'],
      [{ creditLimit: 0 }, 'zero creditLimit'],
      [{ closingDay: 0 }, 'closingDay 0'],
      [{ closingDay: 32 }, 'closingDay 32'],
      [{ dueDay: 0 }, 'dueDay 0'],
      [{ dueDay: 32 }, 'dueDay 32'],
    ])('should reject %s', (invalidFields, _label) => {
      expect(createAccountSchema.safeParse(makeCC(invalidFields)).success).toBe(
        false,
      );
    });

    it('should reject missing creditLimit', () => {
      const { creditLimit: _, ...rest } = makeCC();
      expect(createAccountSchema.safeParse(rest).success).toBe(false);
    });
  });

  it('should reject unknown account type', () => {
    expect(
      createAccountSchema.safeParse({ type: 'SAVINGS', name: 'Test' }).success,
    ).toBe(false);
  });

  it('should reject missing type', () => {
    expect(createAccountSchema.safeParse({ name: 'Test' }).success).toBe(false);
  });
});
