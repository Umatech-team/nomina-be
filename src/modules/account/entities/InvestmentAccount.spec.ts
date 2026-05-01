import { AccountType } from '@constants/enums';
import { InvestmentAccount } from './InvestmentAccount';

describe('InvestmentAccount entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof InvestmentAccount.create>[0]> = {},
  ) {
    return {
      workspaceId: 'ws-1',
      name: 'Tesouro Direto',
      timezone: 'America/Sao_Paulo',
      ...overrides,
    };
  }

  function makeAccount(balance = 1000n) {
    const result = InvestmentAccount.create(makeProps({ balance }));
    if (result.isLeft()) throw result.value;
    return result.value;
  }

  describe('create()', () => {
    it('should create with default balance 0 when not provided', () => {
      const result = InvestmentAccount.create(makeProps());
      expect(result.isRight()).toBe(true);
      if (result.isRight()) expect(result.value.balance).toBe(0n);
    });

    it('should create with provided balance', () => {
      expect(
        InvestmentAccount.create(makeProps({ balance: 500n })).isRight(),
      ).toBe(true);
    });

    it('should reject negative initial balance', () => {
      expect(
        InvestmentAccount.create(makeProps({ balance: -1n })).isLeft(),
      ).toBe(true);
    });

    it('should return type INVESTMENT', () => {
      expect(makeAccount().type).toBe(AccountType.INVESTMENT);
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
      expect(makeAccount().credit(0n).isLeft()).toBe(true);
    });
  });

  describe('debit()', () => {
    it('should decrease balance', () => {
      const account = makeAccount(500n);
      account.debit(200n);
      expect(account.balance).toBe(300n);
    });

    it('should reject debit exceeding balance', () => {
      expect(makeAccount(100n).debit(200n).isLeft()).toBe(true);
    });
  });
});
