import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRecurringTransactionHandler } from './delete-recurring-transaction.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const RECURRING_ID = 'recurring-id-123';

type Request = Parameters<DeleteRecurringTransactionHandler['execute']>[0];

const makeRequest = (overrides: Partial<Request> = {}): Request => ({
  recurringTransactionId: RECURRING_ID,
  workspaceId: WORKSPACE_ID,
  ...overrides,
});

const makeRecurringTransaction = (
  overrides: { workspaceId?: string } = {},
): RecurringTransaction =>
  new RecurringTransaction(
    {
      workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
      accountId: 'account-id-111',
      categoryId: 'category-id-222',
      title: 'Monthly rent',
      description: null,
      amount: 100000n,
      frequency: RecurrenceFrequency.MONTHLY,
      interval: 1,
      startDate: new Date('2026-01-01'),
      endDate: null,
      lastGenerated: null,
      active: true,
      type: 'EXPENSE' as keyof typeof TransactionType,
    },
    RECURRING_ID,
  );

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

describe('DeleteRecurringTransactionHandler', () => {
  let handler: DeleteRecurringTransactionHandler;
  let recurringRepository: jest.Mocked<RecurringTransactionRepository>;

  beforeEach(async () => {
    recurringRepository = createMockRecurringTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRecurringTransactionHandler,
        {
          provide: RecurringTransactionRepository,
          useValue: recurringRepository,
        },
      ],
    }).compile();

    handler = module.get(DeleteRecurringTransactionHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const arrangeSuccessMocks = (recurring = makeRecurringTransaction()) => {
    recurringRepository.findById.mockResolvedValue(recurring);
    recurringRepository.delete.mockResolvedValue(undefined);
    return { recurring };
  };

  it('should delete the recurring transaction and return it on success', async () => {
    const { recurring } = arrangeSuccessMocks();
    const request = makeRequest();

    const result = await handler.execute(request);

    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(recurring);
    expect(recurringRepository.findById).toHaveBeenCalledWith(RECURRING_ID);
    expect(recurringRepository.delete).toHaveBeenCalledWith(RECURRING_ID);
  });

  it('should return left with 404 when recurring transaction is not found', async () => {
    recurringRepository.findById.mockResolvedValue(null);
    const request = makeRequest();

    const result = await handler.execute(request);

    expect(result.isLeft()).toBe(true);
    expect((result.value as HttpException).getStatus()).toBe(
      HttpStatus.NOT_FOUND,
    );
    expect(recurringRepository.delete).not.toHaveBeenCalled();
  });

  it('should return left with 403 when workspaceId does not match the recurring transaction owner', async () => {
    arrangeSuccessMocks(
      makeRecurringTransaction({ workspaceId: 'other-workspace-id' }),
    );
    const request = makeRequest({ workspaceId: WORKSPACE_ID });

    const result = await handler.execute(request);

    expect(result.isLeft()).toBe(true);
    expect((result.value as HttpException).getStatus()).toBe(
      HttpStatus.FORBIDDEN,
    );
    expect(recurringRepository.delete).not.toHaveBeenCalled();
  });
});
