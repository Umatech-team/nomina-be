import { TransactionStatus } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Injectable } from '@nestjs/common';
import { DayJsDateProvider } from '@providers/date/implementations/Dayjs';
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
    private readonly dateProvider: DayJsDateProvider,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({ workspaceId, referenceDate }: Request): Promise<Response> {
    const timezone = 'America/Sao_Paulo'; // TODO: trazer isso das configurações do Workspace/Account.

    const thresholdDate = referenceDate
      ? this.dateProvider.startOfDay(referenceDate, timezone)
      : this.dateProvider.startOfDay(this.dateProvider.now(), timezone);

    const hasAlreadyProcessed = await this.wasProcessedToday(
      workspaceId,
      thresholdDate,
      timezone,
    );
    if (hasAlreadyProcessed) return { generatedCount: 0 };

    const lockAcquired = await this.acquireLock(workspaceId);
    if (!lockAcquired) return { generatedCount: 0 };

    try {
      const recurrings =
        await this.recurringRepository.findNeedingGenerationByWorkspaceId(
          workspaceId,
          thresholdDate,
        );

      let generatedCount = 0;

      for (const recurring of recurrings) {
        const account = await this.accountRepository.findById(
          recurring.accountId,
        );
        if (!account) continue;

        const generated = await this.generateTransactionsForRecurring(
          recurring,
          thresholdDate,
          account.timezone,
        );
        generatedCount += generated;
      }

      await this.markAsProcessedToday(workspaceId, thresholdDate, timezone);

      return { generatedCount };
    } finally {
      await this.releaseLock(workspaceId);
    }
  }

  private async generateTransactionsForRecurring(
    recurring: RecurringTransaction,
    thresholdDate: Date,
    timezone: string,
  ): Promise<number> {
    const transactionsToCreate: Array<Transaction> = [];

    let targetDate = recurring.lastGenerated
      ? this.calculateNextDateService.execute(recurring, timezone)
      : recurring.startDate;

    let generationCount = 0;

    while (targetDate <= thresholdDate) {
      if (generationCount >= MAX_GENERATIONS_PER_RECURRING) {
        console.warn(
          `[RecurringTransaction] Cap reached for recurring ${recurring.id}.`,
        );
        break;
      }

      if (recurring.endDate && targetDate > recurring.endDate) break;

      const transactionOrError = Transaction.create({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        destinationAccountId: recurring.destinationAccountId,
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
        console.error(`Falha ao criar: ${transactionOrError.value}`);
        targetDate = this.calculateNextDateService.execute(recurring, timezone);
        continue;
      }

      transactionsToCreate.push(transactionOrError.value);

      recurring.markAsGenerated(targetDate);

      targetDate = this.calculateNextDateService.execute(recurring, timezone);
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
    timezone: string,
  ): Promise<boolean> {
    const key = this.getCacheKey(workspaceId, date, timezone);
    return await this.redis.exists(key);
  }

  private async markAsProcessedToday(
    workspaceId: string,
    date: Date,
    timezone: string,
  ): Promise<void> {
    const key = this.getCacheKey(workspaceId, date, timezone);
    await this.redis.set(key, '1', CACHE_TTL_SECONDS);
  }

  private getCacheKey(
    workspaceId: string,
    date: Date,
    timezone: string,
  ): string {
    const dateStr = this.dateProvider.format(date, 'YYYY-MM-DD', timezone);
    return `workspace:${workspaceId}:recurring:${dateStr}`;
  }

  private async acquireLock(workspaceId: string): Promise<boolean> {
    const lockKey = `lock:recurring:workspace:${workspaceId}`;
    return await this.redis.acquireLock(lockKey, LOCK_TTL_SECONDS);
  }

  private async releaseLock(workspaceId: string): Promise<void> {
    const lockKey = `lock:recurring:workspace:${workspaceId}`;
    await this.redis.releaseLock(lockKey);
  }
}
