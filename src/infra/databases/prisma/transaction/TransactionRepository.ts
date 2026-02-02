import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionMapper } from './TransactionMapper';

@Injectable()
export class TransactionRepositoryImplementation
  implements TransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listTransactionsByUserId(
    userId: string,
    page: number,
    pageSize: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const transactions =
      startDate && endDate
        ? await this.prisma.transaction.findMany({
            where: {
              workspaceId: userId,
              date: {
                gte: new Date(
                  new Date(startDate).getUTCFullYear(),
                  new Date(startDate).getMonth(),
                  new Date(startDate).getDate(),
                  0,
                  0,
                  0,
                  0,
                ),
                lte: new Date(
                  new Date(endDate).getFullYear(),
                  new Date(endDate).getMonth(),
                  new Date(endDate).getDate(),
                  23,
                  59,
                  59,
                  999,
                ),
              },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
              createdAt: 'desc',
            },
          })
        : await this.prisma.transaction.findMany({
            where: {
              workspaceId: userId,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
              createdAt: 'desc',
            },
          });

    return transactions.map(TransactionMapper.toEntity);
  }

  findTransactionSummaryByUserId = async (
    userId: string,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : 30));

    const transactions = await this.prisma.transaction.groupBy({
      by: ['date', 'type'],
      where: {
        workspaceId: userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: { date: 'asc' },
    });

    const dailySummaryMap = new Map<
      string,
      { income: number; expense: number; date: Date }
    >();

    transactions.forEach((transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      const amount = Number(transaction._sum?.amount ?? 0);

      if (!dailySummaryMap.has(dateKey)) {
        dailySummaryMap.set(dateKey, {
          income: 0,
          expense: 0,
          date: transaction.date,
        });
      }

      const summary = dailySummaryMap.get(dateKey)!;
      if (transaction.type === 'INCOME') {
        summary.income += amount;
      } else if (transaction.type === 'EXPENSE') {
        summary.expense += amount;
      }
    });

    const result = Array.from(dailySummaryMap.values()).map(
      (summary) =>
        new TransactionSummary({
          date: summary.date,
          income: summary.income,
          expense: summary.expense,
        }),
    );

    return result;
  };

  async findUniqueById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    return transaction ? TransactionMapper.toEntity(transaction) : null;
  }

  async create(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.create({
      data: TransactionMapper.toPrisma(transaction),
    });
  }

  async update(transaction: Transaction): Promise<void> {
    console.log('transaction', transaction);
    console.log('transaction.id', transaction.id);
    await this.prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: TransactionMapper.toPrisma(transaction),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: {
        id,
      },
    });
  }

  async getTopExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
    pageSize = 9,
  ): Promise<TopExpensesByCategory[]> {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        workspaceId: userId,
        type: 'EXPENSE',
        date: { gte: normalizedStartDate, lte: normalizedEndDate },
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: pageSize,
    });

    return expenses.map(
      (expense) =>
        new TopExpensesByCategory({
          category: expense.categoryId ?? '',
          total: Number(expense._sum?.amount ?? 0),
        }),
    );
  }
}
