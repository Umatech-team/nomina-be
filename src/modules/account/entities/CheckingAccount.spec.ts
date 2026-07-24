import { AccountType } from '@constants/enums';
import { CheckingAccount } from './CheckingAccount';

function makeProps(
  overrides: Partial<Parameters<typeof CheckingAccount.create>[0]> = {},
) {
  return {
    workspaceId: 'workspace-1',
    name: 'Conta Corrente',
    type: AccountType.CHECKING,
    timezone: 'America/Sao_Paulo',
    balance: 1000n,
    ...overrides,
  };
}
function makeAccount() {
  const result = CheckingAccount.create(makeProps({ balance: 500n }));
  if (result.isLeft()) throw new Error('Failed to create account');
  return result.value;
}
describe('CheckingAccount entity', () => {
  describe('create()', () => {
    it('should create a valid checking account', () => {
      const result = CheckingAccount.create(makeProps());
      expect(result.isRight()).toBe(true);
    });

    it('should default balance to 0 when not provided', () => {
      const result = CheckingAccount.create(makeProps({ balance: undefined }));
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.balance).toBe(0n);
      }
    });

    it('should reject name with less than 2 characters', () => {
      const result = CheckingAccount.create(makeProps({ name: 'A' }));
      expect(result.isLeft()).toBe(true);
    });
  });

  describe('credit()', () => {
    it('should increase balance by credited amount', () => {
      const account = makeAccount();
      account.credit(200n);
      expect(account.balance).toBe(700n);
    });

    it('should reject zero amount', () => {
      const account = makeAccount();
      expect(account.credit(0n).isLeft()).toBe(true);
    });

    it('should reject negative amount', () => {
      const account = makeAccount();
      expect(account.credit(-50n).isLeft()).toBe(true);
    });
  });

  describe('debit()', () => {
    it('should decrease balance by debited amount', () => {
      const account = makeAccount();
      account.debit(200n);
      expect(account.balance).toBe(300n);
    });

    it('should reject zero amount', () => {
      const account = makeAccount();
      expect(account.debit(0n).isLeft()).toBe(true);
    });

    it('should reject negative amount', () => {
      const account = makeAccount();
      expect(account.debit(-10n).isLeft()).toBe(true);
    });
  });

  describe('applyExpenseEffect()', () => {
    it('should behave like debit()', () => {
      const account = makeAccount();
      account.applyExpenseEffect(200n);
      expect(account.balance).toBe(300n);
    });

    it('should reject zero amount', () => {
      expect(makeAccount().applyExpenseEffect(0n).isLeft()).toBe(true);
    });
  });

  describe('applyIncomeEffect()', () => {
    it('should behave like credit()', () => {
      const account = makeAccount();
      account.applyIncomeEffect(200n);
      expect(account.balance).toBe(700n);
    });

    it('should reject negative amount', () => {
      expect(makeAccount().applyIncomeEffect(-50n).isLeft()).toBe(true);
    });
  });
});
