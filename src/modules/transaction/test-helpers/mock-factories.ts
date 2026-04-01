import {
  RecurrenceFrequency,
  TransactionStatus,
  TransactionType,
} from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { CalculateNextGenerationDateService } from '@modules/transaction/services/calculate-next-generation-date.service';

export const createMockTransactionRepository =
  (): jest.Mocked<TransactionRepository> => ({
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

export const createMockRecurringTransactionRepository =
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

export const createMockCalculateNextDateService =
  (): jest.Mocked<CalculateNextGenerationDateService> => ({
    execute: jest.fn(),
  });

export const createMockRedisService = (): jest.Mocked<
  Pick<RedisService, 'exists' | 'set' | 'acquireLock' | 'releaseLock'>
> => ({
  exists: jest.fn(),
  set: jest.fn(),
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
});

interface CreateMockRecurringTransactionOptions {
  id?: string;
  workspaceId?: string;
  accountId?: string;
  destinationAccountId?: string | null;
  categoryId?: string;
  title?: string;
  description?: string | null;
  amount?: bigint;
  frequency?: RecurrenceFrequency;
  interval?: number;
  startDate?: Date;
  endDate?: Date | null;
  lastGenerated?: Date | null;
  active?: boolean;
  type?: keyof typeof TransactionType;
}

export const createMockRecurringTransaction = (
  options: CreateMockRecurringTransactionOptions = {},
): RecurringTransaction => {
  return new RecurringTransaction(
    {
      workspaceId: options.workspaceId ?? 'workspace-id-123',
      accountId: options.accountId ?? 'account-id-123',
      destinationAccountId: options.destinationAccountId ?? null,
      categoryId: options.categoryId ?? 'category-id-123',
      title: options.title ?? 'Monthly Salary',
      description: options.description ?? null,
      amount: options.amount ?? 500000n,
      frequency: options.frequency ?? RecurrenceFrequency.MONTHLY,
      interval: options.interval ?? 1,
      startDate: options.startDate ?? new Date('2026-01-01T00:00:00.000Z'),
      endDate: options.endDate ?? null,
      lastGenerated: options.lastGenerated ?? null,
      active: options.active ?? true,
      type: options.type ?? TransactionType.INCOME,
    },
    options.id ?? 'recurring-id-123',
  );
};

interface CreateMockTransactionOptions {
  id?: string;
  workspaceId?: string;
  accountId?: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  title?: string;
  description?: string | null;
  amount?: bigint;
  date?: Date;
  type?: keyof typeof TransactionType;
  status?: TransactionStatus;
  recurringId?: string | null;
}

export const createMockTransaction = (
  options: CreateMockTransactionOptions = {},
): Transaction => {
  return new Transaction(
    {
      workspaceId: options.workspaceId ?? 'workspace-id-123',
      accountId: options.accountId ?? 'account-id-123',
      destinationAccountId: options.destinationAccountId ?? null,
      categoryId: options.categoryId ?? 'category-id-123',
      title: options.title ?? 'Monthly Salary',
      description: options.description ?? null,
      amount: options.amount ?? 500000n,
      date: options.date ?? new Date('2026-01-15T00:00:00.000Z'),
      type: options.type ?? TransactionType.INCOME,
      status: options.status ?? TransactionStatus.PENDING,
      recurringId: options.recurringId ?? null,
      createdAt: new Date(),
      updatedAt: null,
    },
    options.id ?? 'transaction-id-123',
  );
};
