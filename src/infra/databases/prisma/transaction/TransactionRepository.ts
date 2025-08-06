import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { MonthSumarryWithPercentage } from '@modules/transaction/valueObjects/MonthSumarryWithPercentage';
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
      by: ['date', 'type'],
      where: {
        memberId,
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
      const amount = Number(transaction._sum.amount ?? 0);

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

    const result = Array.from(dailySummaryMap.values()).map((summary) =>
      TransactionMapper.toTransactionSummary(
        new TransactionSummary({
          date: summary.date,
          income: summary.income,
          expense: summary.expense,
        }),
      ),
    );

    return result;
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
    console.log('transaction', transaction);
    console.log('transaction.id', transaction.id);
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
    pageSize = 9,
  ): Promise<TopExpensesByCategory[]> {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        memberId,
        type: 'EXPENSE',
        date: { gte: normalizedStartDate, lte: normalizedEndDate },
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: pageSize,
    });

    return expenses.map((expense) =>
      TransactionMapper.toTopExpensesByCategory(
        new TopExpensesByCategory({
          category: expense.category,
          total: Number(expense._sum.amount ?? 0),
        }),
      ),
    );
  }

  async getMonthlySummary(
    memberId: number,
    currentMonth: Date,
  ): Promise<MonthSumarryWithPercentage> {
    const currentMonthFormatted = new Date(currentMonth);
    currentMonthFormatted.setDate(1);
    currentMonthFormatted.setHours(0, 0, 0, 0);

    let currentMonthSummary = await this.prisma.memberMonthlySummary.findUnique(
      {
        where: {
          memberId_month: { memberId, month: currentMonthFormatted },
        },
      },
    );

    const previousMonth = new Date(currentMonthFormatted);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const previousMonthSummary =
      await this.prisma.memberMonthlySummary.findUnique({
        where: {
          memberId_month: { memberId, month: previousMonth },
        },
      });

    if (!currentMonthSummary) {
      currentMonthSummary = await this.prisma.memberMonthlySummary.create({
        data: {
          memberId,
          month: currentMonthFormatted,
          totalIncome: 0,
          totalExpense: 0,
          totalInvestments: previousMonthSummary?.totalInvestments ?? 0,
          balance: previousMonthSummary?.balance ?? 0,
        },
      });
    }

    const calculatePercentage = (current: number, previous: number): number => {
      if (current === 0 || previous === 0) {
        return 0;
      }

      return ((current - previous) / previous) * 100;
    };

    const incomeChangePercentage = calculatePercentage(
      Number(currentMonthSummary.totalIncome),
      previousMonthSummary ? Number(previousMonthSummary.totalIncome) : 0,
    );
    const expenseChangePercentage = calculatePercentage(
      Number(currentMonthSummary.totalExpense),
      previousMonthSummary ? Number(previousMonthSummary.totalExpense) : 0,
    );
    const investmentsChangePercentage = calculatePercentage(
      Number(currentMonthSummary.totalInvestments),
      previousMonthSummary ? Number(previousMonthSummary.totalInvestments) : 0,
    );
    const balanceChangePercentage = calculatePercentage(
      Number(currentMonthSummary.balance),
      previousMonthSummary ? Number(previousMonthSummary.balance) : 0,
    );

    const result = TransactionMapper.toMonthSummaryWithPercentage({
      ...currentMonthSummary,
      totalIncome: Number(currentMonthSummary.totalIncome),
      totalExpense: Number(currentMonthSummary.totalExpense),
      totalInvestments: Number(currentMonthSummary.totalInvestments),
      balance: Number(currentMonthSummary.balance),
      percentageChanges: {
        income: incomeChangePercentage,
        expense: expenseChangePercentage,
        balance: balanceChangePercentage,
        investments: investmentsChangePercentage,
      },
    }) as MonthSumarryWithPercentage;

    return result;
  }

  async updateMonthlySummary(
    memberId: number,
    month: Date,
    totalIncome?: number,
    totalExpense?: number,
    totalInvestments?: number,
    balance?: number,
  ): Promise<void> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);

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
