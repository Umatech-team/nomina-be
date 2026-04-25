import {
    AccountType,
    TransactionStatus,
    TransactionType,
} from '@constants/enums';
import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { createMockAccountRepository } from '@modules/account/test-helpers/mock-factories';
import { Category } from '@modules/category/entities/Category';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionService } from './create-transaction.handle';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '11111111-1111-1111-1111-111111111111';
const CATEGORY_ID = '22222222-2222-2222-2222-222222222222';

type Request = Parameters<CreateTransactionService['execute']>[0];

const makeRequest = (overrides: Partial<Request> = {}): Request => ({
  sub: 'user-id-123',
  workspaceId: WORKSPACE_ID,
  accountId: ACCOUNT_ID,
  categoryId: null as unknown as string,
  title: 'Grocery shopping',
  amount: 5000,
  date: new Date('2024-01-15'),
  type: TransactionType.EXPENSE,
  ...overrides,
});

const makeAccount = (
  overrides: { workspaceId?: string; balance?: bigint } = {},
): Account =>
  new Account(
    {
      workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
      name: 'Main Account',
      type: AccountType.CHECKING,
      balance: overrides.balance ?? 50000n,
      icon: null,
      color: null,
      closingDay: null,
      dueDay: null,
      creditLimit: null,
    },
    ACCOUNT_ID,
  );

const makeCategory = (
  overrides: { workspaceId?: string | null } = {},
): Category =>
  new Category(
    {
      workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
      name: 'Food',
      type: TransactionType.EXPENSE,
      parentId: null,
      isSystemCategory: false,
    },
    CATEGORY_ID,
  );

const createMockCategoryRepository = (): jest.Mocked<CategoryRepository> => ({
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findUniqueByAttributes: jest.fn(),
  findManyByWorkspaceId: jest.fn(),
  countChildren: jest.fn(),
  countTransactions: jest.fn(),
  reassignChildren: jest.fn(),
  findManyByIds: jest.fn(),
});

const createMockTransactionRepository =
  (): jest.Mocked<TransactionRepository> => ({
    create: jest.fn(),
    findUniqueById: jest.fn(),
    listTransactionsByWorkspaceId: jest.fn(),
    getTopExpensesByCategory: jest.fn(),
    sumTransactionsByDateRange: jest.fn(),
    createWithBalanceUpdate: jest.fn(),
    updateWithBalanceUpdate: jest.fn(),
    deleteWithBalanceReversion: jest.fn(),
    toggleStatusWithBalanceUpdate: jest.fn(),
    findByAccountAndDateRange: jest.fn(),
  });

describe('CreateTransactionService', () => {
  let service: CreateTransactionService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();
    categoryRepository = createMockCategoryRepository();
    transactionRepository = createMockTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: AccountRepository, useValue: accountRepository },
        { provide: CategoryRepository, useValue: categoryRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    service = module.get<CreateTransactionService>(CreateTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const arrangeSuccessMocks = (categoryWorkspaceId?: string | null) => {
    accountRepository.findById.mockResolvedValue(makeAccount());
    if (categoryWorkspaceId !== undefined) {
      categoryRepository.findById.mockResolvedValue(
        makeCategory({ workspaceId: categoryWorkspaceId }),
      );
    }
    transactionRepository.createWithBalanceUpdate.mockResolvedValue(undefined);
  };

  describe('execute – Success Cases', () => {
    it('should create a transaction without category and return Right with the Transaction', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeInstanceOf(Transaction);
      expect(categoryRepository.findById).not.toHaveBeenCalled();
      expect(
        transactionRepository.createWithBalanceUpdate,
      ).toHaveBeenCalledTimes(1);
    });

    it('should create a transaction with a workspace-scoped category and return Right', async () => {
      arrangeSuccessMocks(WORKSPACE_ID);

      const result = await service.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isRight()).toBe(true);
      expect(categoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
      expect(
        transactionRepository.createWithBalanceUpdate,
      ).toHaveBeenCalledTimes(1);
    });

    it('should create a transaction with a global (system) category and return Right', async () => {
      arrangeSuccessMocks(null);

      const result = await service.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isRight()).toBe(true);
      expect(
        transactionRepository.createWithBalanceUpdate,
      ).toHaveBeenCalledTimes(1);
    });

    it.each<[string, TransactionStatus | undefined, TransactionStatus]>([
      ['omitted', undefined, TransactionStatus.COMPLETED],
      ['PENDING', TransactionStatus.PENDING, TransactionStatus.PENDING],
    ])(
      'should return Right with correct status when status input is %s',
      async (_label, statusInput, expectedStatus) => {
        arrangeSuccessMocks();

        const result = await service.execute(
          makeRequest({ status: statusInput }),
        );

        expect(result.isRight()).toBe(true);
        expect((result.value as Transaction).status).toBe(expectedStatus);
      },
    );

    it.each<[TransactionType, bigint, number, number]>([
      [TransactionType.EXPENSE, 50000n, 5000, 45000],
      [TransactionType.INCOME, 50000n, 5000, 55000],
    ])(
      'should compute and pass correct newBalance for %s transaction to createWithBalanceUpdate',
      async (type, balance, amount, expectedBalance) => {
        accountRepository.findById.mockResolvedValue(makeAccount({ balance }));
        transactionRepository.createWithBalanceUpdate.mockResolvedValue(
          undefined,
        );

        await service.execute(makeRequest({ type, amount }));

        const [calledTransaction, calledBalance] =
          transactionRepository.createWithBalanceUpdate.mock.calls[0];

        expect(calledTransaction.amount).toBe(BigInt(amount));
        expect(calledTransaction.workspaceId).toBe(WORKSPACE_ID);
        expect(calledTransaction.accountId).toBe(ACCOUNT_ID);
        expect(calledBalance).toBe(expectedBalance);
      },
    );
  });

  describe('execute – Account Validation', () => {
    it('should call accountRepository.findById with the correct accountId', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await service.execute(makeRequest({ accountId: ACCOUNT_ID }));

      expect(accountRepository.findById).toHaveBeenCalledWith(ACCOUNT_ID);
    });

    it.each([
      ['account is not found', null],
      ['account belongs to a different workspace', 'other-workspace-id'],
    ])('should return Left(401) when %s', async (_label, workspaceId) => {
      accountRepository.findById.mockResolvedValue(
        workspaceId === null ? null : makeAccount({ workspaceId }),
      );

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
      expect(
        transactionRepository.createWithBalanceUpdate,
      ).not.toHaveBeenCalled();
    });
  });

  describe('execute – Category Validation', () => {
    it('should call categoryRepository.findById with the correct categoryId', async () => {
      accountRepository.findById.mockResolvedValue(makeAccount());
      categoryRepository.findById.mockResolvedValue(null);

      await service.execute(makeRequest({ categoryId: CATEGORY_ID }));

      expect(categoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
    });

    it('should skip category validation when categoryId is not provided', async () => {
      arrangeSuccessMocks();

      await service.execute(makeRequest());

      expect(categoryRepository.findById).not.toHaveBeenCalled();
    });

    it.each([
      ['category is not found', null],
      ['category belongs to a different workspace', 'other-workspace-id'],
    ])(
      'should return Left(401) when %s',
      async (_label, categoryWorkspaceId) => {
        accountRepository.findById.mockResolvedValue(makeAccount());
        categoryRepository.findById.mockResolvedValue(
          categoryWorkspaceId === null
            ? null
            : makeCategory({ workspaceId: categoryWorkspaceId }),
        );

        const result = await service.execute(
          makeRequest({ categoryId: CATEGORY_ID }),
        );

        expect(result.isLeft()).toBe(true);
        expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
        expect(
          transactionRepository.createWithBalanceUpdate,
        ).not.toHaveBeenCalled();
      },
    );
  });
});
