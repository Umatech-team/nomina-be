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
    console.log(
      `Starting findTransactionSummaryByMemberId with memberId: ${memberId} and period: ${period}`,
    );

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : 30));

    const startDateUTC = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ),
    );
    const endDateUTC = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
    );

    console.log(`Querying transactions from ${startDateUTC} to ${endDateUTC}`);

    const transactions = await this.prisma.transaction.groupBy({
      by: ['date', 'type'],
      where: {
        memberId,
        date: { gte: startDateUTC, lte: endDateUTC },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: { date: 'asc' },
    });

    console.log(
      `Transactions grouped by date and type: ${JSON.stringify(transactions)}`,
    );

    const result = transactions.map((transaction) => {
      const income =
        transaction.type === 'INCOME' ? (transaction._sum.amount ?? 0) : 0;
      const expense =
        transaction.type === 'EXPENSE' ? (transaction._sum.amount ?? 0) : 0;
      return TransactionMapper.toTransactionSummary(
        new TransactionSummary({
          date: transaction.date,
          income,
          expense,
        }),
      );
    });

    console.log(`Transaction summaries: ${JSON.stringify(result)}`);
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
    const expenses = await this.prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        memberId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: pageSize,
    });

    return expenses.map((expense) =>
      TransactionMapper.toTopExpensesByCategory(
        new TopExpensesByCategory({
          category: expense.category,
          total: expense._sum.amount ?? 0,
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
      if (previous === 0 || current === 0) {
        return 0;
      }

      return ((current - previous) / previous) * 100;
    };

    const incomeChangePercentage = calculatePercentage(
      currentMonthSummary.totalIncome,
      previousMonthSummary ? previousMonthSummary.totalIncome : 0,
    );
    const expenseChangePercentage = calculatePercentage(
      currentMonthSummary.totalExpense,
      previousMonthSummary ? previousMonthSummary.totalExpense : 0,
    );
    const balanceChangePercentage = calculatePercentage(
      currentMonthSummary.balance,
      previousMonthSummary ? previousMonthSummary.balance : 0,
    );

    const result = TransactionMapper.toMonthSummaryWithPercentage({
      ...currentMonthSummary,
      percentageChanges: {
        income: incomeChangePercentage,
        expense: expenseChangePercentage,
        balance: balanceChangePercentage,
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
