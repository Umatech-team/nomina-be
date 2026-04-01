import {
  AccountType,
  RecurrenceFrequency,
  TransactionType,
} from '@constants/enums';
import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { createMockAccountRepository } from '@modules/account/test-helpers/mock-factories';
import { Category } from '@modules/category/entities/Category';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateRecurringTransactionHandler } from './create-recurring-transaction.handle';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '11111111-1111-1111-1111-111111111111';
const CATEGORY_ID = '22222222-2222-2222-2222-222222222222';

type Request = Parameters<CreateRecurringTransactionHandler['execute']>[0];

const makeFutureDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

const makeRequest = (overrides: Partial<Request> = {}): Request => ({
  sub: 'user-id-123',
  workspaceId: WORKSPACE_ID,
  accountId: ACCOUNT_ID,
  categoryId: CATEGORY_ID,
  title: 'Monthly rent',
  amount: 100000n,
  frequency: RecurrenceFrequency.MONTHLY,
  interval: 1,
  startDate: makeFutureDate(),
  endDate: null,
  type: TransactionType.EXPENSE,
  active: true,
  ...overrides,
});

const makeAccount = (
  overrides: { id?: string; workspaceId?: string } = {},
): Account =>
  new Account(
    {
      workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
      name: 'Main Account',
      type: AccountType.CHECKING,
      balance: 0n,
      icon: null,
      color: null,
      closingDay: null,
      dueDay: null,
      creditLimit: null,
    },
    overrides.id ?? ACCOUNT_ID,
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

const makeRecurringTransaction = (): RecurringTransaction =>
  new RecurringTransaction(
    {
      workspaceId: WORKSPACE_ID,
      accountId: ACCOUNT_ID,
      destinationAccountId: null,
      categoryId: CATEGORY_ID,
      title: 'Monthly rent',
      description: null,
      amount: 100000n,
      frequency: RecurrenceFrequency.MONTHLY,
      interval: 1,
      startDate: makeFutureDate(),
      endDate: null,
      lastGenerated: null,
      active: true,
      type: 'EXPENSE' as keyof typeof TransactionType,
    },
    'recurring-id-123',
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

const createMockRecurringTransactionRepository =
  (): jest.Mocked<RecurringTransactionRepository> => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findManyByWorkspaceId: jest.fn(),
    findNeedingGenerationByWorkspaceId: jest.fn(),
    listNeedingGeneration: jest.fn(),
    createGeneratedTransactions: jest.fn(),
  });

describe('CreateRecurringTransactionHandler', () => {
  let handler: CreateRecurringTransactionHandler;
  let accountRepository: jest.Mocked<AccountRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let recurringRepository: jest.Mocked<RecurringTransactionRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();
    categoryRepository = createMockCategoryRepository();
    recurringRepository = createMockRecurringTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRecurringTransactionHandler,
        { provide: AccountRepository, useValue: accountRepository },
        { provide: CategoryRepository, useValue: categoryRepository },
        {
          provide: RecurringTransactionRepository,
          useValue: recurringRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateRecurringTransactionHandler>(
      CreateRecurringTransactionHandler,
    );
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
    recurringRepository.create.mockResolvedValue(makeRecurringTransaction());
  };

  describe('execute – Success Cases', () => {
    it('should create recurring transaction without a category and return Right', async () => {
      arrangeSuccessMocks();

      const result = await handler.execute(
        makeRequest({ categoryId: undefined }),
      );

      expect(result.isRight()).toBe(true);
      expect(categoryRepository.findById).not.toHaveBeenCalled();
      expect(recurringRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create recurring transaction with a workspace-scoped category and return Right', async () => {
      arrangeSuccessMocks(WORKSPACE_ID);

      const result = await handler.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isRight()).toBe(true);
      expect(categoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
      expect(recurringRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create recurring transaction with a global (system) category and return Right', async () => {
      arrangeSuccessMocks(null);

      const result = await handler.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isRight()).toBe(true);
      expect(recurringRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct RecurringTransaction to recurringRepository.create', async () => {
      arrangeSuccessMocks();
      const request = makeRequest({ categoryId: undefined });

      await handler.execute(request);

      const calledWith: RecurringTransaction =
        recurringRepository.create.mock.calls[0][0];
      expect(calledWith.workspaceId).toBe(WORKSPACE_ID);
      expect(calledWith.accountId).toBe(ACCOUNT_ID);
      expect(calledWith.amount).toBe(100000n);
    });
  });

  describe('execute – Account Validation', () => {
    it('should return Left(401) when account is not found', async () => {
      accountRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('should return Left(401) when account belongs to a different workspace', async () => {
      accountRepository.findById.mockResolvedValue(
        makeAccount({ workspaceId: 'other-workspace-id' }),
      );

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('should call accountRepository.findById with the correct accountId', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await handler.execute(makeRequest({ accountId: ACCOUNT_ID }));

      expect(accountRepository.findById).toHaveBeenCalledWith(ACCOUNT_ID);
    });
  });

  describe('execute – Start Date Validation', () => {
    it.each([
      ['today', new Date()],
      [
        'yesterday',
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d;
        })(),
      ],
      [
        'one week ago',
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          return d;
        })(),
      ],
    ])(
      'should return Left(400) when startDate is %s',
      async (_label, startDate) => {
        accountRepository.findById.mockResolvedValue(makeAccount());

        const result = await handler.execute(makeRequest({ startDate }));

        expect(result.isLeft()).toBe(true);
        expect(result.value).toMatchObject({ status: HttpStatus.BAD_REQUEST });
      },
    );
  });

  describe('execute – Category Validation', () => {
    it('should return Left(401) when categoryId is provided but category is not found', async () => {
      accountRepository.findById.mockResolvedValue(makeAccount());
      categoryRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('should return Left(401) when category belongs to a different workspace', async () => {
      accountRepository.findById.mockResolvedValue(makeAccount());
      categoryRepository.findById.mockResolvedValue(
        makeCategory({ workspaceId: 'other-workspace-id' }),
      );

      const result = await handler.execute(
        makeRequest({ categoryId: CATEGORY_ID }),
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('should call categoryRepository.findById with the correct categoryId', async () => {
      accountRepository.findById.mockResolvedValue(makeAccount());
      categoryRepository.findById.mockResolvedValue(null);

      await handler.execute(makeRequest({ categoryId: CATEGORY_ID }));

      expect(categoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
    });
  });

  describe('execute – Entity Creation Failure', () => {
    it('should return Left when RecurringTransaction.create fails', async () => {
      accountRepository.findById.mockResolvedValue(makeAccount());

      const result = await handler.execute(makeRequest({ amount: 0n }));

      expect(result.isLeft()).toBe(true);
      expect(recurringRepository.create).not.toHaveBeenCalled();
    });
  });
});
