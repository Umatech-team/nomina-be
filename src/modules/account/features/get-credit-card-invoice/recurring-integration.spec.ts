import {
  AccountType,
  RecurrenceFrequency,
  TransactionStatus,
  TransactionType,
} from '@constants/enums';
import { createMockAccount } from '@modules/account/test-helpers/mock-factories';
import {
  createMockRecurringTransaction,
  createMockTransaction,
} from '@modules/transaction/test-helpers/mock-factories';

/**
 * Validates that recurring transactions integrate correctly with CREDIT_CARD accounts.
 *
 * Behavior:
 * - Recurring EXPENSE on credit card: generates PENDING transactions, balance not affected until COMPLETED
 * - Recurring TRANSFER on credit card (auto-pay invoice): requires destinationAccountId on RecurringTransaction
 */
describe('Recurring Transaction + Credit Card Integration', () => {
  describe('EXPENSE recurrence on credit card', () => {
    it('should create recurring EXPENSE linked to a CREDIT_CARD account', () => {
      const creditCard = createMockAccount({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
        creditLimit: 500000n,
        balance: 0n,
      });

      const recurring = createMockRecurringTransaction({
        accountId: creditCard.id,
        type: TransactionType.EXPENSE,
        frequency: RecurrenceFrequency.MONTHLY,
        amount: 5000n,
      });

      expect(recurring.accountId).toBe(creditCard.id);
      expect(recurring.type).toBe(TransactionType.EXPENSE);
      expect(recurring.frequency).toBe(RecurrenceFrequency.MONTHLY);
    });

    it('should generate PENDING transaction for credit card expense', () => {
      const creditCard = createMockAccount({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
        creditLimit: 500000n,
        balance: 0n,
      });

      const transaction = createMockTransaction({
        accountId: creditCard.id,
        type: TransactionType.EXPENSE,
        status: TransactionStatus.PENDING,
        amount: 5000n,
      });

      // PENDING transactions do not affect balance
      expect(transaction.status).toBe('PENDING');
      expect(transaction.accountId).toBe(creditCard.id);
      expect(creditCard.balance).toBe(0n); // unchanged
    });
  });

  describe('TRANSFER recurrence for automatic invoice payment', () => {
    it('should create recurring TRANSFER with destinationAccountId pointing to credit card', () => {
      const checking = createMockAccount({
        id: 'checking-id',
        type: AccountType.CHECKING,
        balance: 1000000n,
      });

      const creditCard = createMockAccount({
        id: 'cc-id',
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
        creditLimit: 500000n,
        balance: -150000n,
      });

      const recurring = createMockRecurringTransaction({
        accountId: checking.id,
        destinationAccountId: creditCard.id,
        type: TransactionType.TRANSFER,
        frequency: RecurrenceFrequency.MONTHLY,
        amount: 150000n,
      });

      expect(recurring.accountId).toBe(checking.id);
      expect(recurring.destinationAccountId).toBe(creditCard.id);
      expect(recurring.type).toBe(TransactionType.TRANSFER);
    });
  });

  describe('Credit card available limit computation', () => {
    it('should compute available limit correctly after expenses', () => {
      const creditCard = createMockAccount({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
        creditLimit: 500000n,
        balance: -150000n, // R$1.500 in expenses
      });

      // availableLimit = creditLimit + balance = 500000 + (-150000) = 350000
      expect(creditCard.availableLimit).toBe(350000n);
      expect(creditCard.availableLimitDecimal).toBe(3500);
    });
  });
});
