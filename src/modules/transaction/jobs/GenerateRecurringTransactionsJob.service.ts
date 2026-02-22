import { TransactionStatus } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@shared/core/errors/Either';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { Transaction } from '../entities/Transaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from '../services/CalculateNextGenerationDate.service';

interface Response {
  generatedCount: number;
}

@Injectable()
export class GenerateRecurringTransactionsJobService {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly calculateNextDateService: CalculateNextGenerationDateService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async execute(): Promise<Either<Error, Response>> {
    const referenceDate = new Date();

    referenceDate.setUTCHours(0, 0, 0, 0);
    console.log(`Reference date (UTC): ${referenceDate.toISOString()}`);

    const hasAlreadyProcessed = await this.wasProcessedToday(referenceDate);
    console.log(`Has already processed today: ${hasAlreadyProcessed}`);

    if (hasAlreadyProcessed) {
      console.log('Job already processed today, exiting.');
      return right({ generatedCount: 0 });
    }

    const lockAcquired = await this.acquireLock(referenceDate);
    console.log(`Lock acquired: ${lockAcquired}`);

    if (!lockAcquired) {
      console.log(
        'Could not acquire lock for GenerateRecurringTransactionsJobService. Another instance might be running.',
      );
      return right({ generatedCount: 0 });
    }

    try {
      const recurrings =
        await this.recurringRepository.listActiveNeedingGeneration(
          referenceDate,
        );
      console.log(
        `Found ${recurrings.length} recurring transactions needing generation.`,
      );

      let generatedCount = 0;

      for (const recurring of recurrings) {
        console.log(`Processing recurring transaction: ${recurring.id}`);
        const generated = await this.generateTransactionsForRecurring(
          recurring,
          referenceDate,
        );
        console.log(
          `Generated ${generated} transactions for recurring ${recurring.id}`,
        );
        generatedCount += generated;
      }

      await this.markAsProcessedToday(referenceDate);
      console.log('Marked as processed today.');

      console.log(`Job finished. Total generated: ${generatedCount}`);
      return right({ generatedCount });
    } catch (error) {
      console.error('Error during job execution:', error);
      throw error;
    } finally {
      await this.releaseLock(referenceDate);
      console.log('Lock released.');
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

    console.log(`Initial target date: ${targetDate.toISOString()}`);

    while (targetDate <= referenceDate) {
      console.log(`Evaluating target date: ${targetDate.toISOString()}`);

      if (recurring.endDate && targetDate > recurring.endDate) {
        console.log(
          `Target date ${targetDate.toISOString()} is after end date ${recurring.endDate.toISOString()}, breaking.`,
        );
        break;
      }

      const transactionOrError = new Transaction({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        description: recurring.description,
        amount: recurring.amount,
        date: targetDate,
        type: recurring.type,
        status: TransactionStatus.PENDING,
        recurringId: recurring.id,
      });

      transactionsToCreate.push(transactionOrError);

      recurring.lastGenerated = targetDate;
      targetDate = this.calculateNextDateService.execute(recurring);

      console.log(
        `Next target date calculated as: ${targetDate.toISOString()}`,
      );
    }

    if (transactionsToCreate.length === 0) {
      console.log('No transactions to create for this recurring.');
      return 0;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.createMany({
        data: transactionsToCreate.map((t) => ({
          workspaceId: t.workspaceId,
          accountId: t.accountId,
          categoryId: t.categoryId,
          description: t.description,
          amount: t.amount,
          date: t.date,
          type: t.type,
          status: t.status,
          recurringId: t.recurringId,
        })),
      });

      await tx.recurringTransaction.update({
        where: { id: recurring.id },
        data: { lastGenerated: recurring.lastGenerated },
      });

      console.log(
        `Updated lastGenerated for recurring ${recurring.id} to ${recurring.lastGenerated?.toISOString()}`,
      );
    });

    return transactionsToCreate.length;
  }

  private async wasProcessedToday(date: Date): Promise<boolean> {
    const key = this.getCacheKey(date);
    const exists = await this.redis.exists(key);
    console.log(`Checking if processed today with key ${key}: ${exists}`);
    return exists;
  }

  private async markAsProcessedToday(date: Date): Promise<void> {
    const key = this.getCacheKey(date);
    await this.redis.set(key, '1', 86400);
    console.log(`Marked as processed today with key ${key}`);
  }

  private getCacheKey(date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    const key = `recurring:${dateStr}`;
    console.log(`Generated cache key: ${key}`);
    return key;
  }

  private async acquireLock(date: Date): Promise<boolean> {
    const lockKey = `lock:recurring:${date.toISOString().split('T')[0]}`;
    const acquired = await this.redis.acquireLock(lockKey, 30);
    console.log(`Acquiring lock with key ${lockKey}: ${acquired}`);
    return acquired;
  }

  private async releaseLock(date: Date): Promise<void> {
    const lockKey = `lock:recurring:${date.toISOString().split('T')[0]}`;
    await this.redis.releaseLock(lockKey);
    console.log(`Released lock with key ${lockKey}`);
  }
}
