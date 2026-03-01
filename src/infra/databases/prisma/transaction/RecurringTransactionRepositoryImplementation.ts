import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecurringTransactionMapper } from './RecurringTransactionMapper';
import { TransactionMapper } from './TransactionMapper';

@Injectable()
export class RecurringTransactionRepositoryImplementation
  implements RecurringTransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async findActiveNeedingGenerationByWorkspaceId(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        active: true,
        startDate: { lte: referenceDate },
        OR: [{ endDate: null }, { endDate: { gte: referenceDate } }],
      },
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async listActiveNeedingGeneration(
    referenceDate: Date,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        active: true,
        startDate: { lte: referenceDate },
        OR: [{ endDate: null }, { endDate: { gte: referenceDate } }],
      },
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async create(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction> {
    const created = await this.prisma.recurringTransaction.create({
      data: RecurringTransactionMapper.toPrisma(recurringTransaction),
    });
    return RecurringTransactionMapper.toEntity(created);
  }

  async update(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction> {
    const updated = await this.prisma.recurringTransaction.update({
      where: { id: recurringTransaction.id },
      data: RecurringTransactionMapper.toPrisma(recurringTransaction),
    });
    return RecurringTransactionMapper.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recurringTransaction.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<RecurringTransaction | null> {
    const recurring = await this.prisma.recurringTransaction.findUnique({
      where: { id },
    });
    return recurring ? RecurringTransactionMapper.toEntity(recurring) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: { workspaceId },
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async findActiveByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        active: true,
      },
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async findActiveNeedingGeneration(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        active: true,
        startDate: { lte: referenceDate },
        endDate: { gte: referenceDate },
      },
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
    isActive?: boolean,
  ): Promise<{ recurrings: RecurringTransaction[]; total: number }> {
    const where = {
      workspaceId,
      ...(isActive !== undefined ? { active: isActive } : {}),
    };
    const [recurrings, total] = await Promise.all([
      this.prisma.recurringTransaction.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.recurringTransaction.count({ where }),
    ]);
    return { recurrings: recurrings.map(RecurringTransactionMapper.toEntity), total };
  }

  async findNeedingGenerationByWorkspaceId(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        active: true,
        startDate: { lte: referenceDate },
        OR: [
          { lastGenerated: null },
          { lastGenerated: { lt: referenceDate } },
        ],
      },
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async listNeedingGeneration(
    referenceDate: Date,
    limit: number,
    offset: number,
  ): Promise<RecurringTransaction[]> {
    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        active: true,
        startDate: { lte: referenceDate },
        OR: [
          { lastGenerated: null },
          { lastGenerated: { lt: referenceDate } },
        ],
      },
      take: limit,
      skip: offset,
    });
    return recurrings.map(RecurringTransactionMapper.toEntity);
  }

  async createGeneratedTransactions(
    transactions: Transaction[],
    updatedRecurring: RecurringTransaction,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.createMany({
        data: transactions.map(TransactionMapper.toPrisma),
      });
      await tx.recurringTransaction.update({
        where: { id: updatedRecurring.id },
        data: { lastGenerated: updatedRecurring.lastGenerated },
      });
    });
  }
}
