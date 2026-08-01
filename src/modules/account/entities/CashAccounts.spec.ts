import { AccountType } from '@constants/enums';
import {
  InsufficientBalanceError,
  ValidationAccountError,
} from '@modules/account/errors';
import { CashAccount } from './CashAccounts';

describe('CashAccount entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof CashAccount.create>[0]> = {},
  ) {
    return {
      workspaceId: 'ws-1',
      name: 'Carteira',
      timezone: 'America/Sao_Paulo',
      ...overrides,
    };
  }

  function makeAccount(balance = 1000n) {
    const result = CashAccount.create(makeProps({ balance }));
    if (result.isLeft()) throw result.value;
    return result.value;
  }

  describe('create()', () => {
    it('should create with default balance 0 when not provided', () => {
      const result = CashAccount.create(makeProps());
      expect(result.isRight()).toBe(true);
      if (result.isRight()) expect(result.value.balance).toBe(0n);
    });

    it('should create with provided balance', () => {
      const result = CashAccount.create(makeProps({ balance: 500n }));
      expect(result.isRight()).toBe(true);
    });

    it('should reject negative initial balance', () => {
      const result = CashAccount.create(makeProps({ balance: -1n }));
      expect(result.isLeft()).toBe(true);
      if (result.isLeft())
        expect(result.value).toBeInstanceOf(ValidationAccountError);
    });

    it('should return type CASH', () => {
      expect(makeAccount().type).toBe(AccountType.CASH);
    });

    it('patrimonyContribution should equal balance', () => {
      const account = makeAccount(800n);
      expect(account.patrimonyContribution).toBe(800n);
    });
  });

  describe('credit()', () => {
    it('should increase balance', () => {
      const account = makeAccount(500n);
      account.credit(200n);
      expect(account.balance).toBe(700n);
    });

    it('should reject zero amount', () => {
      const result = makeAccount().credit(0n);
      expect(result.isLeft()).toBe(true);
      if (result.isLeft())
        expect(result.value).toBeInstanceOf(ValidationAccountError);
    });

    it('should reject negative amount', () => {
      expect(makeAccount().credit(-10n).isLeft()).toBe(true);
    });
  });

  describe('debit()', () => {
    it('should decrease balance', () => {
      const account = makeAccount(500n);
      account.debit(200n);
      expect(account.balance).toBe(300n);
    });

    it('should reject zero amount', () => {
      expect(makeAccount().debit(0n).isLeft()).toBe(true);
    });

    it('should reject negative amount', () => {
      expect(makeAccount().debit(-10n).isLeft()).toBe(true);
    });

    it('should reject debit exceeding balance', () => {
      const account = makeAccount(100n);
      const result = account.debit(200n);
      expect(result.isLeft()).toBe(true);
      if (result.isLeft())
        expect(result.value).toBeInstanceOf(InsufficientBalanceError);
    });
  });

  describe('applyExpenseEffect()', () => {
    it('should behave like debit()', () => {
      const account = makeAccount(500n);
      account.applyExpenseEffect(200n);
      expect(account.balance).toBe(300n);
    });

    it('should reject expense exceeding balance', () => {
      const account = makeAccount(100n);
      expect(account.applyExpenseEffect(200n).isLeft()).toBe(true);
    });
  });

  describe('applyIncomeEffect()', () => {
    it('should behave like credit()', () => {
      const account = makeAccount(500n);
      account.applyIncomeEffect(200n);
      expect(account.balance).toBe(700n);
    });

    it('should reject zero amount', () => {
      expect(makeAccount().applyIncomeEffect(0n).isLeft()).toBe(true);
    });
  });
});
