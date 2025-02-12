import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionMapper } from './TransactionMapper';

@Injectable()
export class TransactionRepositoryImplementation
  implements TransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listTransactionsByMemberId(
    memberId: number,
    page: number,
    pageSize: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const transactions =
      startDate && endDate
        ? await this.prisma.transaction.findMany({
            where: {
              memberId,
              date: {
                gte: startDate,
                lte: endDate,
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
              memberId,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
              createdAt: 'desc',
            },
          });

    return transactions.map(TransactionMapper.toEntity);
  }

  findTransactionSummaryByMemberId = async (
    memberId: number,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : 30));
    const transactions = await this.prisma.transaction.groupBy({
      by: ['createdAt', 'type'],
      where: {
        memberId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return transactions.map((transaction) => {
      const income =
        transaction.type === 'INCOME' ? (transaction._sum.amount ?? 0) : 0;
      const expense =
        transaction.type === 'EXPENSE' ? (transaction._sum.amount ?? 0) : 0;
      return TransactionMapper.toTransactionSummary(
        new TransactionSummary({
          date: transaction.createdAt,
          income,
          expense,
        }),
      );
    });
  };

  async findUniqueById(id: number): Promise<Transaction | null> {
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
    await this.prisma.transaction.update({
      where: {
        id: transaction.id as number,
      },
      data: TransactionMapper.toPrisma(transaction),
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.transaction.delete({
      where: {
        id,
      },
    });
  }

  async getTopExpensesByCategory(
    memberId: number,
    startDate: Date,
    endDate: Date,
    limit = 9,
  ): Promise<Map<string, number>> {
    const expenses = await this.prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        memberId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    return new Map(
      expenses.map((exp) => [
        exp.category,
        exp._sum.amount ? parseFloat(exp._sum.amount.toFixed(2)) : 0,
      ]),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMonthlySummary(memberId: number, currentMonth: Date): Promise<any> {
    const currentMonthFormatted = new Date(currentMonth);
    currentMonthFormatted.setDate(1);
    currentMonthFormatted.setHours(0, 0, 0, 0);
    const currentMonthSummary =
      await this.prisma.memberMonthlySummary.findUnique({
        where: {
          memberId_month: { memberId, month: currentMonthFormatted },
        },
      });

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const previousMonthSummary =
      await this.prisma.memberMonthlySummary.findUnique({
        where: {
          memberId_month: { memberId, month: previousMonth },
        },
      });

    if (!previousMonthSummary) {
      return { ...currentMonthSummary, percentageChanges: null };
    }

    const calculatePercentage = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : -100;
      return ((current - previous) / previous) * 100;
    };

    if (!currentMonthSummary) {
      return { percentageChanges: null };
    }

    const incomeChangePercentage = calculatePercentage(
      currentMonthSummary.totalIncome,
      previousMonthSummary.totalIncome,
    );
    const expenseChangePercentage = calculatePercentage(
      currentMonthSummary.totalExpense,
      previousMonthSummary.totalExpense,
    );
    const balanceChangePercentage = calculatePercentage(
      currentMonthSummary.balance,
      previousMonthSummary.balance,
    );

    return {
      ...currentMonthSummary,
      percentageChanges: {
        income: incomeChangePercentage,
        expense: expenseChangePercentage,
        balance: balanceChangePercentage,
      },
    };
  }

  async updateMonthlySummary(
    memberId: number,
    month: Date,
    totalIncome?: number,
    totalExpense?: number,
    totalInvestments?: number,
    balance?: number,
  ): Promise<void> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1); // primeiro dia do mês

    await this.prisma.memberMonthlySummary.upsert({
      where: {
        memberId_month: { memberId, month: startOfMonth },
      },
      update: {
        totalIncome,
        totalExpense,
        totalInvestments,
        balance,
      },
      create: {
        memberId,
        month: startOfMonth,
        totalIncome,
        totalExpense,
        totalInvestments,
        balance,
      },
    });
  }
}
