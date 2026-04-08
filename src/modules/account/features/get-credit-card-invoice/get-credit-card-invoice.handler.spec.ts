import { AccountType } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
    createMockAccount,
    createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import {
    createMockTransaction,
    createMockTransactionRepository,
} from '@modules/transaction/test-helpers/mock-factories';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetCreditCardInvoiceRequest } from './get-credit-card-invoice.dto';
import { GetCreditCardInvoiceHandler } from './get-credit-card-invoice.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = 'account-id-cc';
const USER_ID = 'user-id-abc';

const makeRequest = (
  overrides: Partial<
    GetCreditCardInvoiceRequest & {
      workspaceId: string;
      sub: string;
      accountId: string;
    }
  > = {},
): GetCreditCardInvoiceRequest & {
  workspaceId: string;
  sub: string;
  accountId: string;
} => ({
  month: 3,
  year: 2026,
  workspaceId: WORKSPACE_ID,
  sub: USER_ID,
  accountId: ACCOUNT_ID,
  ...overrides,
});

const makeCreditCardAccount = () =>
  createMockAccount({
    id: ACCOUNT_ID,
    workspaceId: WORKSPACE_ID,
    type: AccountType.CREDIT_CARD,
    closingDay: 15,
    dueDay: 10,
    creditLimit: 500000n,
    balance: -150000n,
  });

describe('GetCreditCardInvoiceHandler', () => {
  let handler: GetCreditCardInvoiceHandler;
  let accountRepository: jest.Mocked<AccountRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();
    transactionRepository = createMockTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCreditCardInvoiceHandler,
        { provide: AccountRepository, useValue: accountRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    handler = module.get<GetCreditCardInvoiceHandler>(
      GetCreditCardInvoiceHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should return invoice with correct period (closingDay=15, month=3)', async () => {
      const account = makeCreditCardAccount();
      const transactions = [
        createMockTransaction({ amount: 10000n, accountId: ACCOUNT_ID }),
        createMockTransaction({ amount: 5000n, accountId: ACCOUNT_ID }),
      ];
      accountRepository.findById.mockResolvedValue(account);
      transactionRepository.findByAccountAndDateRange.mockResolvedValue(
        transactions,
      );

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        // closingDay=15, month=3 → periodStart = Feb 16, periodEnd = Mar 15
        expect(result.value.periodStart.getMonth()).toBe(1); // Feb (0-indexed)
        expect(result.value.periodStart.getDate()).toBe(16);
        expect(result.value.periodEnd.getMonth()).toBe(2); // Mar (0-indexed)
        expect(result.value.periodEnd.getDate()).toBe(15);
        // dueDate = April 10 (month after closing)
        expect(result.value.dueDate.getMonth()).toBe(3); // Apr (0-indexed)
        expect(result.value.dueDate.getDate()).toBe(10);
        expect(result.value.totalAmount).toBe(15000);
        expect(result.value.availableLimit).toBe(485000); // 500000 - 15000
        expect(result.value.transactions).toHaveLength(2);
      }
    });

    it('should default to current month/year when not provided', async () => {
      const account = makeCreditCardAccount();
      accountRepository.findById.mockResolvedValue(account);
      transactionRepository.findByAccountAndDateRange.mockResolvedValue([]);

      const result = await handler.execute(
        makeRequest({ month: undefined, year: undefined }),
      );

      expect(result.isRight()).toBe(true);
      expect(
        transactionRepository.findByAccountAndDateRange,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('execute – Error Cases', () => {
    it('should return Left(404) when account not found', async () => {
      accountRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return Left(403) when account belongs to another workspace', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'other-workspace',
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should return Left(400) when account is not a credit card', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        type: AccountType.CHECKING,
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should not query transactions when account validation fails', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await handler.execute(makeRequest());

      expect(
        transactionRepository.findByAccountAndDateRange,
      ).not.toHaveBeenCalled();
    });
  });
});
