import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecurringTransactionMapper } from './RecurringTransactionMapper';

@Injectable()
export class RecurringTransactionRepositoryImplementation
  implements RecurringTransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}

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
}
