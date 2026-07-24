import { RecurrenceFrequency } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { DateProvider } from '@providers/date/contracts/DateProvider';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from '../services/calculate-next-generation-date.service';
import { GenerateRecurringTransactionsJobService } from './create-recurring-transaction.service';

function makeRecurring(
  overrides: Partial<Parameters<typeof RecurringTransaction.create>[0]> = {},
) {
  const result = RecurringTransaction.create({
    workspaceId: 'ws-1',
    accountId: 'acc-1',
    title: 'Aluguel',
    amount: 150000n,
    frequency: RecurrenceFrequency.MONTHLY,
    startDate: new Date('2024-01-01'),
    type: 'EXPENSE',
    ...overrides,
  });
  if (result.isLeft()) throw result.value;
  return result.value;
}

describe('GenerateRecurringTransactionsJobService', () => {
  let service: GenerateRecurringTransactionsJobService;
  let recurringRepository: jest.Mocked<RecurringTransactionRepository>;
  let calculateNextDateService: jest.Mocked<CalculateNextGenerationDateService>;
  let redis: jest.Mocked<RedisService>;
  let dateProvider: jest.Mocked<DateProvider>;

  const NOW = new Date('2024-01-15T00:00:00.000Z');

  beforeEach(() => {
    recurringRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findManyByWorkspaceId: jest.fn(),
      findNeedingGenerationByWorkspaceId: jest.fn(),
      listNeedingGeneration: jest.fn().mockResolvedValue([]),
      createGeneratedTransactions: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<RecurringTransactionRepository>;

    calculateNextDateService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateNextGenerationDateService>;

    redis = {
      onModuleDestroy: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true),
      exists: jest.fn().mockResolvedValue(false),
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
      delByPattern: jest.fn().mockResolvedValue(0),
      getClient: jest.fn().mockReturnValue(null),
      isAvailable: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<RedisService>;

    dateProvider = {
      now: jest.fn().mockReturnValue(NOW),
      add: jest.fn(),
      format: jest.fn(),
      toTimezone: jest.fn(),
      calculateInvoiceCycle: jest.fn(),
      addDaysInCurrentDate: jest.fn(),
      parse: jest.fn(),
      startOfDay: jest.fn(),
      endOfDay: jest.fn(),
      startOfMonth: jest.fn(),
      endOfMonth: jest.fn(),
    } as jest.Mocked<DateProvider>;

    service = new GenerateRecurringTransactionsJobService(
      recurringRepository,
      calculateNextDateService,
      redis,
      dateProvider,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('execute()', () => {
    it('should skip processing when the job already ran today', async () => {
      redis.exists.mockResolvedValue(true);

      const result = await service.execute();

      expect(result.isRight()).toBe(true);
      if (result.isRight()) expect(result.value.generatedCount).toBe(0);
      expect(redis.acquireLock).not.toHaveBeenCalled();
      expect(recurringRepository.listNeedingGeneration).not.toHaveBeenCalled();
    });

    it('should skip processing when the lock cannot be acquired', async () => {
      redis.acquireLock.mockResolvedValue(false);

      const result = await service.execute();

      expect(result.isRight()).toBe(true);
      if (result.isRight()) expect(result.value.generatedCount).toBe(0);
      expect(recurringRepository.listNeedingGeneration).not.toHaveBeenCalled();
    });

    it('should mark the day as processed and release the lock after a successful run', async () => {
      recurringRepository.listNeedingGeneration.mockResolvedValue([]);

      await service.execute();

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('processed:recurring:'),
        '1',
        86400,
      );
      expect(redis.releaseLock).toHaveBeenCalled();
    });

    it('should release the lock and rethrow when a critical error happens', async () => {
      recurringRepository.listNeedingGeneration.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.execute()).rejects.toThrow('db down');
      expect(redis.releaseLock).toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('should paginate through batches until a partial page is returned', async () => {
      const fullBatch = Array.from({ length: 50 }, (_, i) =>
        makeRecurring({ startDate: new Date('2024-02-01'), title: `Rec ${i}` }),
      );

      recurringRepository.listNeedingGeneration
        .mockResolvedValueOnce(fullBatch)
        .mockResolvedValueOnce([]);

      await service.execute();

      expect(recurringRepository.listNeedingGeneration).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should skip a recurring whose first generation date is already past the threshold', async () => {
      const recurring = makeRecurring({ startDate: new Date('2024-02-01') });
      recurringRepository.listNeedingGeneration.mockResolvedValue([recurring]);

      const result = await service.execute();

      expect(
        recurringRepository.createGeneratedTransactions,
      ).not.toHaveBeenCalled();
      if (result.isRight()) expect(result.value.generatedCount).toBe(0);
    });

    it('should generate due transactions, persist them and mark the recurring as generated', async () => {
      const recurring = makeRecurring({ startDate: new Date('2024-01-10') });
      recurringRepository.listNeedingGeneration.mockResolvedValue([recurring]);
      calculateNextDateService.execute.mockReturnValue(new Date('2024-02-10'));

      const result = await service.execute();

      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledTimes(1);
      const [transactions, updatedRecurring] =
        recurringRepository.createGeneratedTransactions.mock.calls[0];
      expect(transactions).toHaveLength(1);
      expect(updatedRecurring.lastGenerated).toEqual(new Date('2024-01-10'));
      if (result.isRight()) expect(result.value.generatedCount).toBe(1);
    });

    it('should log and skip a target date whose transaction fails validation, then keep going', async () => {
      const invalidRecurring = makeRecurring({
        startDate: new Date('2024-01-10'),
      });
      Object.defineProperty(invalidRecurring, 'amount', { get: () => 0n });

      recurringRepository.listNeedingGeneration.mockResolvedValue([
        invalidRecurring,
      ]);
      calculateNextDateService.execute.mockReturnValueOnce(
        new Date('2024-02-10'),
      );

      const result = await service.execute();

      expect(
        recurringRepository.createGeneratedTransactions,
      ).not.toHaveBeenCalled();
      if (result.isRight()) expect(result.value.generatedCount).toBe(0);
    });

    it('should stop generating once the safety cap is reached', async () => {
      const recurring = makeRecurring({ startDate: new Date('2024-01-10') });
      recurringRepository.listNeedingGeneration.mockResolvedValue([recurring]);

      // Always return a date within the threshold so the loop only stops via the cap.
      calculateNextDateService.execute.mockReturnValue(new Date('2024-01-11'));

      const result = await service.execute();

      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledTimes(1);
      const [transactions] =
        recurringRepository.createGeneratedTransactions.mock.calls[0];
      expect(transactions).toHaveLength(365);
      if (result.isRight()) expect(result.value.generatedCount).toBe(365);
    });

    it('should deactivate the recurring once generation passes its endDate', async () => {
      const recurring = makeRecurring({
        startDate: new Date('2023-11-10'),
        endDate: new Date('2024-01-10'),
      });
      recurringRepository.listNeedingGeneration.mockResolvedValue([recurring]);
      calculateNextDateService.execute
        .mockReturnValueOnce(new Date('2024-01-10'))
        .mockReturnValueOnce(new Date('2024-01-15'));

      await service.execute();

      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledTimes(1);
      const [transactions, updatedRecurring] =
        recurringRepository.createGeneratedTransactions.mock.calls[0];
      expect(transactions).toHaveLength(2);
      expect(updatedRecurring.active).toBe(false);
    });

    it('should not deactivate a recurring without an endDate', async () => {
      const recurring = makeRecurring({ startDate: new Date('2024-01-10') });
      recurringRepository.listNeedingGeneration.mockResolvedValue([recurring]);
      calculateNextDateService.execute.mockReturnValue(new Date('2024-02-10'));

      await service.execute();

      const [, updatedRecurring] =
        recurringRepository.createGeneratedTransactions.mock.calls[0];
      expect(updatedRecurring.active).toBe(true);
    });
  });
});
