import { TransactionStatus } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { Transaction } from '../entities/Transaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from './CalculateNextGenerationDate.service';

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
    private readonly prisma: PrismaService,
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
        await this.recurringRepository.findActiveNeedingGenerationByWorkspaceId(
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

    while (nextDate <= referenceDate) {
      if (recurring.endDate && nextDate > recurring.endDate) break;

      const transactionOrError = new Transaction({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        description: recurring.description,
        amount: recurring.amount,
        date: nextDate,
        type: recurring.type,
        status: TransactionStatus.PENDING,
        recurringId: recurring.id,
      });
      transactionsToCreate.push(transactionOrError);

      currentDate = nextDate;

      recurring.lastGenerated = currentDate;
      nextDate = this.calculateNextDateService.execute(recurring);
    }

    if (transactionsToCreate.length === 0) return 0;

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
        data: { lastGenerated: currentDate },
      });
    });

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
    await this.redis.set(key, '1', 86400);
  }

  private getCacheKey(workspaceId: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    return `workspace:${workspaceId}:recurring:${dateStr}`;
  }

  private async acquireLock(workspaceId: string): Promise<boolean> {
    const lockKey = `lock:recurring:${workspaceId}`;
    return await this.redis.acquireLock(lockKey, 30);
  }

  private async releaseLock(workspaceId: string): Promise<void> {
    const lockKey = `lock:recurring:${workspaceId}`;
    await this.redis.releaseLock(lockKey);
  }
}
