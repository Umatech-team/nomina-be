import { TransactionStatus, TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionNotFoundError } from '@modules/transaction/errors';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindTransactionByIdService } from './find-transaction.handle';

function makeRequest(overrides = {}) {
  return { sub: 'user-1', transactionId: 'tx-1', ...overrides };
}

function makeUser(): User {
  const result = User.create(
    { name: 'John Doe', email: 'j@j.com', passwordHash: 'hash' },
    'user-1',
  );
  if (result.isLeft()) throw result.value;
  return result.value;
}

function makeTransaction(): Transaction {
  const result = Transaction.create(
    {
      workspaceId: 'ws-1',
      accountId: 'acc-1',
      title: 'Test',
      amount: 1000n,
      date: new Date('2024-01-01'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.COMPLETED,
    },
    'tx-1',
  );
  if (result.isLeft()) throw result.value;
  return result.value;
}

describe('FindTransactionByIdService', () => {
  let service: FindTransactionByIdService;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    transactionRepository = {
      findUniqueById: jest.fn(),
      create: jest.fn(),
      listTransactionsByWorkspaceId: jest.fn(),
      getTopExpensesByCategory: jest.fn(),
      sumTransactionsByDateRange: jest.fn(),
      createWithBalanceUpdate: jest.fn(),
      updateWithBalanceUpdate: jest.fn(),
      deleteWithBalanceReversion: jest.fn(),
      toggleStatusWithBalanceUpdate: jest.fn(),
      findByAccountAndDateRange: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    userRepository = {
      findUniqueById: jest.fn(),
      findUniqueByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new FindTransactionByIdService(
      transactionRepository,
      userRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(UnauthorizedError) when user is not found', async () => {
    userRepository.findUniqueById.mockResolvedValue(null);

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('should return left(TransactionNotFoundError) when transaction does not exist', async () => {
    userRepository.findUniqueById.mockResolvedValue(makeUser());
    transactionRepository.findUniqueById.mockResolvedValue(null);

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(TransactionNotFoundError);
  });

  it('should return right with transaction on success', async () => {
    const tx = makeTransaction();
    userRepository.findUniqueById.mockResolvedValue(makeUser());
    transactionRepository.findUniqueById.mockResolvedValue(tx);

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value).toBe(tx);
  });
});
