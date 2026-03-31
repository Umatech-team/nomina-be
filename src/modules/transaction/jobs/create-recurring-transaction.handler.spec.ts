import { RecurrenceFrequency } from '@constants/enums';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from '../services/calculate-next-generation-date.service';
import {
  createMockCalculateNextDateService,
  createMockRecurringTransaction,
  createMockRecurringTransactionRepository,
  createMockRedisService,
} from '../test-helpers/mock-factories';
import { GenerateRecurringTransactionsJobHandler } from './create-recurring-transaction.handler';

describe('GenerateRecurringTransactionsJobHandler', () => {
  let handler: GenerateRecurringTransactionsJobHandler;
  let recurringRepository: jest.Mocked<RecurringTransactionRepository>;
  let calculateNextDateService: jest.Mocked<CalculateNextGenerationDateService>;
  let redis: ReturnType<typeof createMockRedisService>;

  const referenceDate = new Date('2026-03-31T00:00:00.000Z');

  const makeRecurring = (
    overrides?: Parameters<typeof createMockRecurringTransaction>[0],
  ): RecurringTransaction => createMockRecurringTransaction(overrides);

  const arrangeSuccessMocks = () => {
    redis.exists.mockResolvedValue(false);
    redis.acquireLock.mockResolvedValue(true);
    redis.set.mockResolvedValue(true);
    redis.releaseLock.mockResolvedValue(true);
  };

  beforeEach(() => {
    recurringRepository = createMockRecurringTransactionRepository();
    calculateNextDateService = createMockCalculateNextDateService();
    redis = createMockRedisService();

    handler = new GenerateRecurringTransactionsJobHandler(
      recurringRepository,
      calculateNextDateService,
      redis as unknown as import('@infra/cache/redis/RedisService').RedisService,
    );

    jest.useFakeTimers().setSystemTime(referenceDate);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return 0 when already processed today', async () => {
      redis.exists.mockResolvedValue(true);

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 0 });
      expect(recurringRepository.listNeedingGeneration).not.toHaveBeenCalled();
    });

    it('should return 0 when lock cannot be acquired', async () => {
      redis.exists.mockResolvedValue(false);
      redis.acquireLock.mockResolvedValue(false);

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 0 });
      expect(recurringRepository.listNeedingGeneration).not.toHaveBeenCalled();
    });

    it('should acquire lock with 300s TTL', async () => {
      arrangeSuccessMocks();
      recurringRepository.listNeedingGeneration.mockResolvedValue([]);

      await handler.execute();

      expect(redis.acquireLock).toHaveBeenCalledWith(
        expect.stringContaining('lock:recurring:'),
        300,
      );
    });

    it('should always release lock even on error', async () => {
      arrangeSuccessMocks();
      recurringRepository.listNeedingGeneration.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(handler.execute()).rejects.toThrow('DB error');
      expect(redis.releaseLock).toHaveBeenCalled();
    });

    it('should mark as processed with 86400s TTL after success', async () => {
      arrangeSuccessMocks();
      recurringRepository.listNeedingGeneration.mockResolvedValue([]);

      await handler.execute();

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('recurring:'),
        '1',
        86400,
      );
    });

    it('should process all recurrings in a single batch', async () => {
      arrangeSuccessMocks();

      const recurring = makeRecurring({
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        lastGenerated: null,
      });

      recurringRepository.listNeedingGeneration.mockResolvedValueOnce([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // startDate is 2026-03-01, referenceDate is 2026-03-31
      // For monthly frequency: startDate <= referenceDate, so 1 transaction
      // After first iteration, nextDate = 2026-04-01 > referenceDate, loop stops
      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-04-01T00:00:00.000Z'),
      );

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 1 });
      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledTimes(1);
    });

    it('should paginate through multiple batches', async () => {
      arrangeSuccessMocks();

      // First batch: 50 items (BATCH_SIZE) -> triggers next batch
      // Second batch: 10 items -> loop ends
      const batch1 = Array.from({ length: 50 }, (_, i) =>
        makeRecurring({
          id: `recurring-batch1-${i}`,
          startDate: new Date('2026-03-01T00:00:00.000Z'),
        }),
      );
      const batch2 = Array.from({ length: 10 }, (_, i) =>
        makeRecurring({
          id: `recurring-batch2-${i}`,
          startDate: new Date('2026-03-01T00:00:00.000Z'),
        }),
      );

      recurringRepository.listNeedingGeneration
        .mockResolvedValueOnce(batch1)
        .mockResolvedValueOnce(batch2);

      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // Each recurring generates 1 transaction then nextDate > referenceDate
      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-04-01T00:00:00.000Z'),
      );

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 60 });
      expect(recurringRepository.listNeedingGeneration).toHaveBeenCalledTimes(
        2,
      );
      expect(recurringRepository.listNeedingGeneration).toHaveBeenNthCalledWith(
        1,
        expect.any(Date),
        50,
        0,
      );
      expect(recurringRepository.listNeedingGeneration).toHaveBeenNthCalledWith(
        2,
        expect.any(Date),
        50,
        50,
      );
    });

    it('should return 0 when no recurrings need generation', async () => {
      arrangeSuccessMocks();
      recurringRepository.listNeedingGeneration.mockResolvedValue([]);

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 0 });
    });
  });

  describe('generateTransactionsForRecurring (via execute)', () => {
    it('should respect MAX_GENERATIONS_PER_RECURRING cap of 365', async () => {
      arrangeSuccessMocks();

      const recurring = makeRecurring({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: new Date('2020-01-01T00:00:00.000Z'),
        lastGenerated: null,
      });

      recurringRepository.listNeedingGeneration.mockResolvedValueOnce([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // Simulate weekly: keep returning dates within range for 400+ iterations
      calculateNextDateService.execute.mockImplementation(() => {
        // Always return a date before referenceDate to force the cap
        return new Date('2026-03-30T00:00:00.000Z');
      });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      // Should generate exactly 365 (first iteration uses startDate, capped at 365)
      expect(result.value).toEqual({ generatedCount: 365 });
      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Object)]),
        expect.any(Object),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cap reached for recurring'),
      );

      warnSpy.mockRestore();
    });

    it('should update lastGenerated even when cap is reached', async () => {
      arrangeSuccessMocks();

      const recurring = makeRecurring({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: new Date('2020-01-01T00:00:00.000Z'),
        lastGenerated: null,
      });

      recurringRepository.listNeedingGeneration.mockResolvedValueOnce([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-03-30T00:00:00.000Z'),
      );

      jest.spyOn(console, 'warn').mockImplementation();

      await handler.execute();

      // createGeneratedTransactions receives the updated recurring with lastGenerated set
      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          lastGenerated: expect.any(Date),
        }),
      );

      jest.restoreAllMocks();
    });

    it('should stop generating when endDate is reached', async () => {
      arrangeSuccessMocks();

      const recurring = makeRecurring({
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: new Date('2026-03-15T00:00:00.000Z'),
        lastGenerated: null,
      });

      recurringRepository.listNeedingGeneration.mockResolvedValueOnce([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // startDate (Mar 1) <= referenceDate (Mar 31): creates first transaction
      // nextDate (Apr 1) > endDate (Mar 15): break
      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-04-01T00:00:00.000Z'),
      );

      const result = await handler.execute();

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual({ generatedCount: 1 });
    });
  });
});
