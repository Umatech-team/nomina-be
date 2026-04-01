import { AccountType } from '@constants/enums';
import { Account } from './Account';

const makeProps = (
  overrides: Partial<Parameters<typeof Account.create>[0]> = {},
) => ({
  workspaceId: 'workspace-id-123',
  name: 'My Account',
  type: AccountType.CHECKING,
  balance: 0n,
  ...overrides,
});

describe('Account Entity', () => {
  describe('create – Success Cases', () => {
    it('should create a valid CHECKING account', () => {
      const result = Account.create(makeProps());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('My Account');
        expect(result.value.type).toBe(AccountType.CHECKING);
        expect(result.value.creditLimit).toBeNull();
      }
    });

    it('should create a valid CREDIT_CARD account with closingDay, dueDay and creditLimit', () => {
      const result = Account.create(
        makeProps({
          type: AccountType.CREDIT_CARD,
          closingDay: 15,
          dueDay: 10,
          creditLimit: 500000n,
        }),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.type).toBe(AccountType.CREDIT_CARD);
        expect(result.value.closingDay).toBe(15);
        expect(result.value.dueDay).toBe(10);
        expect(result.value.creditLimit).toBe(500000n);
      }
    });

    it('should accept CHECKING account with creditLimit', () => {
      const result = Account.create(makeProps({ creditLimit: 100000n }));

      expect(result.isRight()).toBe(true);
    });

    it('should default creditLimit to null when not provided', () => {
      const result = Account.create(makeProps());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.creditLimit).toBeNull();
      }
    });
  });

  describe('create – CREDIT_CARD validation', () => {
    it('should return Left when CREDIT_CARD has no closingDay', () => {
      const result = Account.create(
        makeProps({
          type: AccountType.CREDIT_CARD,
          dueDay: 10,
        }),
      );

      expect(result.isLeft()).toBe(true);
    });

    it('should return Left when CREDIT_CARD has no dueDay', () => {
      const result = Account.create(
        makeProps({
          type: AccountType.CREDIT_CARD,
          closingDay: 15,
        }),
      );

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('create – creditLimit validation', () => {
    it('should return Left when creditLimit is negative', () => {
      const result = Account.create(makeProps({ creditLimit: -100n }));

      expect(result.isLeft()).toBe(true);
    });

    it('should return Left when creditLimit is zero', () => {
      const result = Account.create(makeProps({ creditLimit: 0n }));

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should compute availableLimit correctly (creditLimit + balance)', () => {
      const account = new Account(
        {
          workspaceId: 'ws-1',
          name: 'Card',
          type: AccountType.CREDIT_CARD,
          balance: -150000n,
          icon: null,
          color: null,
          closingDay: 15,
          dueDay: 10,
          creditLimit: 500000n,
        },
        'id-1',
      );

      expect(account.availableLimit).toBe(350000n);
      expect(account.availableLimitDecimal).toBe(3500);
    });

    it('should return null for availableLimit when creditLimit is null', () => {
      const account = new Account(
        {
          workspaceId: 'ws-1',
          name: 'Checking',
          type: AccountType.CHECKING,
          balance: 100000n,
          icon: null,
          color: null,
          closingDay: null,
          dueDay: null,
          creditLimit: null,
        },
        'id-1',
      );

      expect(account.availableLimit).toBeNull();
      expect(account.availableLimitDecimal).toBeNull();
    });

    it('should compute creditLimitDecimal correctly', () => {
      const account = new Account(
        {
          workspaceId: 'ws-1',
          name: 'Card',
          type: AccountType.CREDIT_CARD,
          balance: 0n,
          icon: null,
          color: null,
          closingDay: 15,
          dueDay: 10,
          creditLimit: 500000n,
        },
        'id-1',
      );

      expect(account.creditLimitDecimal).toBe(5000);
    });

    it('should return null for creditLimitDecimal when creditLimit is null', () => {
      const account = new Account(
        {
          workspaceId: 'ws-1',
          name: 'Checking',
          type: AccountType.CHECKING,
          balance: 0n,
          icon: null,
          color: null,
          closingDay: null,
          dueDay: null,
          creditLimit: null,
        },
        'id-1',
      );

      expect(account.creditLimitDecimal).toBeNull();
    });
  });
});
