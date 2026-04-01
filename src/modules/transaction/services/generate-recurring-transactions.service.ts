import { TransactionStatus } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { Injectable } from '@nestjs/common';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { Transaction } from '../entities/Transaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from './calculate-next-generation-date.service';

const LOCK_TTL_SECONDS = 120;
const CACHE_TTL_SECONDS = 86400;
const MAX_GENERATIONS_PER_RECURRING = 365;

interface Request {
  workspaceId: string;
  referenceDate?: Date;
}
interface Response {
  generatedCount: number;
}
@Injectable()
export class GenerateRecurringTransactionsService {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly calculateNextDateService: CalculateNextGenerationDateService,
    private readonly redis: RedisService,
  ) {}

  async execute({
    workspaceId,
    referenceDate = new Date(),
  }: Request): Promise<Response> {
    const hasAlreadyProcessed = await this.wasProcessedToday(
      workspaceId,
      referenceDate,
    );

    if (hasAlreadyProcessed) {
      return { generatedCount: 0 };
    }

    const lockAcquired = await this.acquireLock(workspaceId);
    if (!lockAcquired) {
      return { generatedCount: 0 };
    }

    try {
      const recurrings =
        await this.recurringRepository.findNeedingGenerationByWorkspaceId(
          workspaceId,
          referenceDate,
        );

      let generatedCount = 0;

      for (const recurring of recurrings) {
        const generated = await this.generateTransactionsForRecurring(
          recurring,
          referenceDate,
        );
        generatedCount += generated;
      }

      await this.markAsProcessedToday(workspaceId, referenceDate);

      return { generatedCount };
    } finally {
      await this.releaseLock(workspaceId);
    }
  }

  private async generateTransactionsForRecurring(
    recurring: RecurringTransaction,
    referenceDate: Date,
  ): Promise<number> {
    const transactionsToCreate: Array<Transaction> = [];
    let currentDate = recurring.lastGenerated ?? recurring.startDate;

    let nextDate = this.calculateNextDateService.execute(recurring);
    let generationCount = 0;

    while (nextDate <= referenceDate) {
      if (generationCount >= MAX_GENERATIONS_PER_RECURRING) {
        console.warn(
          `[RecurringTransaction] Cap reached for recurring ${recurring.id}. ` +
            `Generated ${generationCount} transactions. Remaining will be generated in next run.`,
        );
        break;
      }

      if (recurring.endDate && nextDate > recurring.endDate) break;

      const transactionOrError = Transaction.create({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        destinationAccountId: recurring.destinationAccountId,
        categoryId: recurring.categoryId,
        title: recurring.title,
        description: recurring.description,
        amount: recurring.amount,
        date: nextDate,
        type: recurring.type,
        status: TransactionStatus.PENDING,
        recurringId: recurring.id,
      });

      if (transactionOrError.isLeft()) {
        console.error(
          `Failed to create transaction for recurring ${recurring.id} on date ${nextDate.toISOString()}:`,
          transactionOrError.value,
        );
        currentDate = nextDate;
        recurring.lastGenerated = currentDate;
        nextDate = this.calculateNextDateService.execute(recurring);
        continue;
      }

      transactionsToCreate.push(transactionOrError.value);

      currentDate = nextDate;

      recurring.lastGenerated = currentDate;
      nextDate = this.calculateNextDateService.execute(recurring);
      generationCount++;
    }

    if (transactionsToCreate.length === 0) return 0;

    await this.recurringRepository.createGeneratedTransactions(
      transactionsToCreate,
      recurring,
    );

    return transactionsToCreate.length;
  }

  private async wasProcessedToday(
    workspaceId: string,
    date: Date,
  ): Promise<boolean> {
    const key = this.getCacheKey(workspaceId, date);
    return await this.redis.exists(key);
  }

  private async markAsProcessedToday(
    workspaceId: string,
    date: Date,
  ): Promise<void> {
    const key = this.getCacheKey(workspaceId, date);
    await this.redis.set(key, '1', CACHE_TTL_SECONDS);
  }

  private getCacheKey(workspaceId: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    return `workspace:${workspaceId}:recurring:${dateStr}`;
  }

  private async acquireLock(workspaceId: string): Promise<boolean> {
    const lockKey = `lock:recurring:${workspaceId}`;
    return await this.redis.acquireLock(lockKey, LOCK_TTL_SECONDS);
  }

  private async releaseLock(workspaceId: string): Promise<void> {
    const lockKey = `lock:recurring:${workspaceId}`;
    await this.redis.releaseLock(lockKey);
  }
}
