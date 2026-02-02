import { TransactionStatus, TransactionType } from '@constants/enums';
import { RedisService } from '@infra/cache/redis/RedisService';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';
import { CalculateNextGenerationDateService } from './CalculateNextGenerationDate.service';

interface Request {
  workspaceId: string;
  referenceDate?: Date; // Default: hoje
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
    // 1. Verificar cache Redis (opcional)
    if (await this.wasProcessedToday(workspaceId, referenceDate)) {
      return { generatedCount: 0 }; // Já processado hoje
    }

    // 2. Tentar adquirir lock distribuído (opcional)
    const lockAcquired = await this.acquireLock(workspaceId);
    if (!lockAcquired) {
      return { generatedCount: 0 }; // Outro processo está gerando
    }

    try {
      // 3. Buscar recorrências ativas que precisam geração
      const recurrings =
        await this.recurringRepository.findActiveNeedingGeneration(
          workspaceId,
          referenceDate,
        );

      let generatedCount = 0;

      // 4. Processar cada recorrência
      for (const recurring of recurrings) {
        const generated = await this.generateTransactionsForRecurring(
          recurring,
          referenceDate,
        );
        generatedCount += generated;
      }

      // 5. Marcar como processado no cache
      await this.markAsProcessedToday(workspaceId, referenceDate);

      return { generatedCount };
    } finally {
      // 6. Liberar lock
      await this.releaseLock(workspaceId);
    }
  }

  private async generateTransactionsForRecurring(
    recurring: RecurringTransaction,
    referenceDate: Date,
  ): Promise<number> {
    const transactionsToCreate: Array<{
      workspaceId: string;
      accountId: string;
      categoryId: string | null;
      description: string;
      amount: bigint;
      date: Date;
      type: TransactionType;
      status: TransactionStatus;
      recurringId: string;
    }> = [];
    let currentDate = recurring.lastGenerated ?? recurring.startDate;

    // Calcular primeira data a gerar
    let nextDate = this.calculateNextDateService.execute(recurring);

    // Gerar todas as transações pendentes até referenceDate
    while (nextDate <= referenceDate) {
      // Verificar se já passou endDate
      if (recurring.endDate && nextDate > recurring.endDate) break;

      // Inferir tipo baseado no contexto
      const type = this.inferTransactionType(recurring);

      transactionsToCreate.push({
        workspaceId: recurring.workspaceId,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        description: recurring.description,
        amount: recurring.amount,
        date: nextDate,
        type,
        status: TransactionStatus.PENDING, // Nascem como PENDING
        recurringId: recurring.id,
      });

      // Avançar para próxima data
      currentDate = nextDate;

      // Atualizar lastGenerated temporariamente para calcular próxima
      recurring.lastGenerated = currentDate;
      nextDate = this.calculateNextDateService.execute(recurring);
    }

    if (transactionsToCreate.length === 0) return 0;

    // Usar Prisma transaction para atomicidade
    await this.prisma.$transaction(async (tx) => {
      // Criar transactions em batch
      await tx.transaction.createMany({
        data: transactionsToCreate,
      });

      // Atualizar lastGenerated
      await tx.recurringTransaction.update({
        where: { id: recurring.id },
        data: { lastGenerated: currentDate },
      });
    });

    return transactionsToCreate.length;
  }

  private inferTransactionType(
    recurring: RecurringTransaction,
  ): TransactionType {
    // Estratégia 1: Verificar se description contém palavras-chave
    const description = recurring.description.toLowerCase();

    // Palavras de expense
    if (
      description.includes('pagamento') ||
      description.includes('conta') ||
      description.includes('despesa') ||
      description.includes('aluguel') ||
      description.includes('mensalidade')
    ) {
      return TransactionType.EXPENSE;
    }

    // Palavras de income
    if (
      description.includes('salário') ||
      description.includes('receita') ||
      description.includes('renda')
    ) {
      return TransactionType.INCOME;
    }

    // Default: EXPENSE (maioria das recorrências são despesas)
    return TransactionType.EXPENSE;
  }

  // Redis Cache Helpers
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
    await this.redis.set(key, '1', 86400); // TTL 24h
  }

  private getCacheKey(workspaceId: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `workspace:${workspaceId}:recurring:${dateStr}`;
  }

  // Distributed Lock Helpers
  private async acquireLock(workspaceId: string): Promise<boolean> {
    const lockKey = `lock:recurring:${workspaceId}`;
    return await this.redis.acquireLock(lockKey, 30);
  }

  private async releaseLock(workspaceId: string): Promise<void> {
    const lockKey = `lock:recurring:${workspaceId}`;
    await this.redis.releaseLock(lockKey);
  }
}
