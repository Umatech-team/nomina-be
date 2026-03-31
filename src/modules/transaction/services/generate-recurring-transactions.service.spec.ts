import { RecurrenceFrequency } from '@constants/enums';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import {
  createMockCalculateNextDateService,
  createMockRecurringTransaction,
  createMockRecurringTransactionRepository,
  createMockRedisService,
} from '../test-helpers/mock-factories';
import { CalculateNextGenerationDateService } from './calculate-next-generation-date.service';
import { GenerateRecurringTransactionsService } from './generate-recurring-transactions.service';

describe('GenerateRecurringTransactionsService', () => {
  let service: GenerateRecurringTransactionsService;
  let recurringRepository: jest.Mocked<RecurringTransactionRepository>;
  let calculateNextDateService: jest.Mocked<CalculateNextGenerationDateService>;
  let redis: ReturnType<typeof createMockRedisService>;

  const workspaceId = 'workspace-id-123';
  const referenceDate = new Date('2026-03-31T00:00:00.000Z');

  const makeRequest = (overrides?: {
    workspaceId?: string;
    referenceDate?: Date;
  }) => ({
    workspaceId: overrides?.workspaceId ?? workspaceId,
    referenceDate: overrides?.referenceDate ?? referenceDate,
  });

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

    service = new GenerateRecurringTransactionsService(
      recurringRepository,
      calculateNextDateService,
      redis as unknown as import('@infra/cache/redis/RedisService').RedisService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return 0 when already processed today', async () => {
      redis.exists.mockResolvedValue(true);

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 0 });
      expect(
        recurringRepository.findNeedingGenerationByWorkspaceId,
      ).not.toHaveBeenCalled();
    });

    it('should return 0 when lock cannot be acquired', async () => {
      redis.exists.mockResolvedValue(false);
      redis.acquireLock.mockResolvedValue(false);

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 0 });
      expect(
        recurringRepository.findNeedingGenerationByWorkspaceId,
      ).not.toHaveBeenCalled();
    });

    it('should acquire lock with 120s TTL', async () => {
      arrangeSuccessMocks();
      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue(
        [],
      );

      await service.execute(makeRequest());

      expect(redis.acquireLock).toHaveBeenCalledWith(
        `lock:recurring:${workspaceId}`,
        120,
      );
    });

    it('should always release lock even on error', async () => {
      arrangeSuccessMocks();
      recurringRepository.findNeedingGenerationByWorkspaceId.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.execute(makeRequest())).rejects.toThrow('DB error');
      expect(redis.releaseLock).toHaveBeenCalled();
    });

    it('should mark as processed with 86400s TTL after success', async () => {
      arrangeSuccessMocks();
      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue(
        [],
      );

      await service.execute(makeRequest());

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining(`workspace:${workspaceId}:recurring:`),
        '1',
        86400,
      );
    });

    it('should generate transactions for recurrings needing generation', async () => {
      arrangeSuccessMocks();

      const recurring = createMockRecurringTransaction({
        workspaceId,
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        lastGenerated: new Date('2026-03-01T00:00:00.000Z'),
      });

      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // nextDate after lastGenerated → within range, then second call → out of range
      calculateNextDateService.execute
        .mockReturnValueOnce(new Date('2026-03-15T00:00:00.000Z'))
        .mockReturnValueOnce(new Date('2026-04-01T00:00:00.000Z'));

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 1 });
      expect(
        recurringRepository.createGeneratedTransactions,
      ).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no recurrings need generation', async () => {
      arrangeSuccessMocks();
      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue(
        [],
      );

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 0 });
    });
  });

  describe('generation cap', () => {
    it('should respect MAX_GENERATIONS_PER_RECURRING cap of 365', async () => {
      arrangeSuccessMocks();

      const recurring = createMockRecurringTransaction({
        workspaceId,
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: new Date('2020-01-01T00:00:00.000Z'),
        lastGenerated: new Date('2020-01-01T00:00:00.000Z'),
      });

      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // Always return a date within range to force the cap
      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-03-30T00:00:00.000Z'),
      );

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 365 });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cap reached for recurring'),
      );

      warnSpy.mockRestore();
    });

    it('should update lastGenerated even when cap is reached', async () => {
      arrangeSuccessMocks();

      const recurring = createMockRecurringTransaction({
        workspaceId,
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: new Date('2020-01-01T00:00:00.000Z'),
        lastGenerated: new Date('2020-01-01T00:00:00.000Z'),
      });

      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-03-30T00:00:00.000Z'),
      );

      jest.spyOn(console, 'warn').mockImplementation();

      await service.execute(makeRequest());

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

      const recurring = createMockRecurringTransaction({
        workspaceId,
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: new Date('2026-03-10T00:00:00.000Z'),
        lastGenerated: new Date('2026-03-01T00:00:00.000Z'),
      });

      recurringRepository.findNeedingGenerationByWorkspaceId.mockResolvedValue([
        recurring,
      ]);
      recurringRepository.createGeneratedTransactions.mockResolvedValue();

      // First nextDate is within range but after endDate
      calculateNextDateService.execute.mockReturnValue(
        new Date('2026-03-15T00:00:00.000Z'),
      );

      const result = await service.execute(makeRequest());

      expect(result).toEqual({ generatedCount: 0 });
    });
  });
});
