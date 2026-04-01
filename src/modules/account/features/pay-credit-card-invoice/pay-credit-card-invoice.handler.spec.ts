import { AccountType } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { createMockTransactionRepository } from '@modules/transaction/test-helpers/mock-factories';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayCreditCardInvoiceRequest } from './pay-credit-card-invoice.dto';
import { PayCreditCardInvoiceHandler } from './pay-credit-card-invoice.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const CREDIT_CARD_ID = 'cc-account-id';
const SOURCE_ID = 'source-account-id';
const USER_ID = 'user-id-abc';

const makeRequest = (
  overrides: Partial<
    PayCreditCardInvoiceRequest & {
      workspaceId: string;
      sub: string;
      creditCardAccountId: string;
    }
  > = {},
): PayCreditCardInvoiceRequest & {
  workspaceId: string;
  sub: string;
  creditCardAccountId: string;
} => ({
  sourceAccountId: SOURCE_ID,
  amount: 150,
  description: null,
  categoryId: null,
  workspaceId: WORKSPACE_ID,
  sub: USER_ID,
  creditCardAccountId: CREDIT_CARD_ID,
  ...overrides,
});

const makeCreditCardAccount = () =>
  createMockAccount({
    id: CREDIT_CARD_ID,
    workspaceId: WORKSPACE_ID,
    type: AccountType.CREDIT_CARD,
    closingDay: 15,
    dueDay: 10,
    creditLimit: 500000n,
    balance: -150000n,
  });

const makeSourceAccount = () =>
  createMockAccount({
    id: SOURCE_ID,
    workspaceId: WORKSPACE_ID,
    type: AccountType.CHECKING,
    balance: 500000n,
  });

const arrangeSuccessMocks = (
  accountRepository: jest.Mocked<AccountRepository>,
  transactionRepository: jest.Mocked<TransactionRepository>,
) => {
  accountRepository.findById
    .mockResolvedValueOnce(makeCreditCardAccount())
    .mockResolvedValueOnce(makeSourceAccount());
  transactionRepository.createWithBalanceUpdate.mockResolvedValue(undefined);
};

describe('PayCreditCardInvoiceHandler', () => {
  let handler: PayCreditCardInvoiceHandler;
  let accountRepository: jest.Mocked<AccountRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();
    transactionRepository = createMockTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayCreditCardInvoiceHandler,
        { provide: AccountRepository, useValue: accountRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    handler = module.get<PayCreditCardInvoiceHandler>(
      PayCreditCardInvoiceHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should create TRANSFER transaction and update balances', async () => {
      arrangeSuccessMocks(accountRepository, transactionRepository);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.type).toBe('TRANSFER');
        expect(result.value.accountId).toBe(SOURCE_ID);
        expect(result.value.destinationAccountId).toBe(CREDIT_CARD_ID);
        expect(result.value.amount).toBe(15000n); // 150 * 100
      }
      expect(
        transactionRepository.createWithBalanceUpdate,
      ).toHaveBeenCalledWith(
        expect.anything(),
        485000, // 500000 - 15000
        -135000, // -150000 + 15000
      );
    });

    it('should accept partial payment (amount < total invoice)', async () => {
      arrangeSuccessMocks(accountRepository, transactionRepository);

      const result = await handler.execute(makeRequest({ amount: 50 }));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.amount).toBe(5000n);
      }
    });
  });

  describe('execute – Error Cases', () => {
    it('should return Left(404) when credit card not found', async () => {
      accountRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return Left(403) when credit card belongs to another workspace', async () => {
      const cc = createMockAccount({
        id: CREDIT_CARD_ID,
        workspaceId: 'other-ws',
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 10,
      });
      accountRepository.findById.mockResolvedValue(cc);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should return Left(400) when account is not a credit card', async () => {
      const checking = createMockAccount({
        id: CREDIT_CARD_ID,
        workspaceId: WORKSPACE_ID,
        type: AccountType.CHECKING,
      });
      accountRepository.findById.mockResolvedValue(checking);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return Left(404) when source account not found', async () => {
      accountRepository.findById
        .mockResolvedValueOnce(makeCreditCardAccount())
        .mockResolvedValueOnce(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return Left(403) when source account belongs to another workspace', async () => {
      const source = createMockAccount({
        id: SOURCE_ID,
        workspaceId: 'other-ws',
        type: AccountType.CHECKING,
      });
      accountRepository.findById
        .mockResolvedValueOnce(makeCreditCardAccount())
        .mockResolvedValueOnce(source);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should return Left(400) when source is a credit card', async () => {
      const sourceCC = createMockAccount({
        id: SOURCE_ID,
        workspaceId: WORKSPACE_ID,
        type: AccountType.CREDIT_CARD,
        closingDay: 20,
        dueDay: 5,
      });
      accountRepository.findById
        .mockResolvedValueOnce(makeCreditCardAccount())
        .mockResolvedValueOnce(sourceCC);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return Left(400) when source equals credit card', async () => {
      const cc = makeCreditCardAccount();
      accountRepository.findById.mockResolvedValue(cc);

      const result = await handler.execute(
        makeRequest({
          sourceAccountId: CREDIT_CARD_ID,
          creditCardAccountId: CREDIT_CARD_ID,
        }),
      );

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
