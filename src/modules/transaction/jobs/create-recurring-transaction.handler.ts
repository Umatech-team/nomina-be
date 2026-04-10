import { TransactionStatus } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@shared/core/errors/Either';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { Transaction } from '../entities/Transaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from '../services/calculate-next-generation-date.service';

const BATCH_SIZE = 50;
const LOCK_TTL_SECONDS = 300;
const CACHE_TTL_SECONDS = 86400;
const MAX_GENERATIONS_PER_RECURRING = 365;

interface Response {
  generatedCount: number;
}

@Injectable()
export class GenerateRecurringTransactionsJobHandler {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly calculateNextDateService: CalculateNextGenerationDateService,
    private readonly redis: RedisService,
  ) {}

  async execute(): Promise<Either<Error, Response>> {
    const referenceDate = new Date();

    referenceDate.setUTCHours(0, 0, 0, 0);

    const hasAlreadyProcessed = await this.wasProcessedToday(referenceDate);

    if (hasAlreadyProcessed) {
      console.log('Job already processed today, exiting.');
      return right({ generatedCount: 0 });
    }

    referenceDate.setUTCDate(referenceDate.getUTCDate() + 7);
    console.log(`Reference date (UTC): ${referenceDate.toISOString()}`);

    const lockAcquired = await this.acquireLock(referenceDate);
    if (!lockAcquired) {
      console.log(
        'Could not acquire lock for GenerateRecurringTransactionsJobHandler. Another instance might be running.',
      );
      return right({ generatedCount: 0 });
    }

    try {
      let generatedCount = 0;
      let offset = 0;
      let batch: RecurringTransaction[];

      do {
        batch = await this.recurringRepository.listNeedingGeneration(
          referenceDate,
          BATCH_SIZE,
          offset,
        );
        for (const recurring of batch) {
          const generated = await this.generateTransactionsForRecurring(
            recurring,
            referenceDate,
          );
          generatedCount += generated;
        }

        offset += BATCH_SIZE;
      } while (batch.length === BATCH_SIZE);

      await this.markAsProcessedToday(referenceDate);

      return right({ generatedCount });
    } catch (error) {
      console.error('Error during job execution:', error);
      throw error;
    } finally {
      await this.releaseLock(referenceDate);
    }
  }

  private async generateTransactionsForRecurring(
    recurring: RecurringTransaction,
    referenceDate: Date,
  ): Promise<number> {
    const transactionsToCreate: Array<Transaction> = [];

    let targetDate = recurring.lastGenerated
      ? this.calculateNextDateService.execute(recurring)
      : recurring.startDate;

    let generationCount = 0;

    while (targetDate <= referenceDate) {
      if (generationCount >= MAX_GENERATIONS_PER_RECURRING) {
        console.warn(
          `[RecurringTransaction] Cap reached for recurring ${recurring.id}. ` +
            `Generated ${generationCount} transactions. Remaining will be generated in next run.`,
        );
        break;
      }

      if (recurring.endDate && targetDate > recurring.endDate) {
        console.log(
          `Target date ${targetDate.toISOString()} is after end date ${recurring.endDate.toISOString()}, breaking.`,
        );
        break;
      }

      const transactionOrError = Transaction.create({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        title: recurring.title,
        description: recurring.description,
        amount: recurring.amount,
        date: targetDate,
        type: recurring.type,
        status: TransactionStatus.PENDING,
        recurringId: recurring.id,
      });

      if (transactionOrError.isLeft()) {
        console.error(
          `Error creating transaction for recurring ${recurring.id} on date ${targetDate.toISOString()}:`,
          transactionOrError.value,
        );
        targetDate = this.calculateNextDateService.execute(recurring);
        continue;
      }

      transactionsToCreate.push(transactionOrError.value);

      recurring.lastGenerated = targetDate;
      targetDate = this.calculateNextDateService.execute(recurring);
      generationCount++;
    }

    if (transactionsToCreate.length === 0) {
      console.log('No transactions to create for this recurring.');
      return 0;
    }

    await this.recurringRepository.createGeneratedTransactions(
      transactionsToCreate,
      recurring,
    );

    return transactionsToCreate.length;
  }

  private async wasProcessedToday(date: Date): Promise<boolean> {
    const key = this.getCacheKey(date);
    const exists = await this.redis.exists(key);
    return exists;
  }

  private async markAsProcessedToday(date: Date): Promise<void> {
    const key = this.getCacheKey(date);
    await this.redis.set(key, '1', CACHE_TTL_SECONDS);
  }

  private getCacheKey(date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    const key = `recurring:${dateStr}`;
    return key;
  }

  private async acquireLock(date: Date): Promise<boolean> {
    const lockKey = `lock:recurring:${date.toISOString().split('T')[0]}`;
    const acquired = await this.redis.acquireLock(lockKey, LOCK_TTL_SECONDS);
    return acquired;
  }

  private async releaseLock(date: Date): Promise<void> {
    const lockKey = `lock:recurring:${date.toISOString().split('T')[0]}`;
    await this.redis.releaseLock(lockKey);
  }
}
