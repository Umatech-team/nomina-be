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
    workspaceId: string,
    page: number,
    pageSize: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const transactions =
      startDate && endDate
        ? await this.prisma.transaction.findMany({
            where: {
              workspaceId,
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
              workspaceId,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
              createdAt: 'desc',
            },
          });

    return transactions.map(TransactionMapper.toEntity);
  }

  listTransactionsSummaryByWorkspaceId = async (
    workspaceId: string,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : 30));

    const transactions = await this.prisma.transaction.groupBy({
      by: ['date', 'type'],
      where: {
        workspaceId,
        date: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
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

    const sortedSummaries = Array.from(dailySummaryMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    let accumulatedBalance = 0;
    const result = sortedSummaries.map((summary) => {
      accumulatedBalance += summary.income - summary.expense;
      return new TransactionSummary({
        date: summary.date,
        income: summary.income,
        expense: summary.expense,
        balance: accumulatedBalance,
      });
    });

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

  async sumTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    const incomeResult = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        workspaceId,
        type: 'INCOME',
        status: 'COMPLETED',
        date: { gte: normalizedStartDate, lte: normalizedEndDate },
      },
    });

    const expenseResult = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        workspaceId,
        type: 'EXPENSE',
        status: 'COMPLETED',
        date: { gte: normalizedStartDate, lte: normalizedEndDate },
      },
    });

    const totalIncome = Number(incomeResult._sum.amount ?? 0n);
    const totalExpense = Number(expenseResult._sum.amount ?? 0n);
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }

  async createWithBalanceUpdate(transaction: Transaction): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: TransactionMapper.toPrisma(transaction),
      });

      if (transaction.status === 'COMPLETED') {
        const balanceDelta =
          transaction.type === 'INCOME'
            ? Number(transaction.amount)
            : -Number(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceDelta } },
        });
      }
    });
  }

  async updateWithBalanceUpdate(
    oldTransaction: Transaction,
    newTransaction: Transaction,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const oldEffect =
        oldTransaction.status === 'COMPLETED'
          ? oldTransaction.type === 'INCOME'
            ? Number(oldTransaction.amount)
            : -Number(oldTransaction.amount)
          : 0;

      const newEffect =
        newTransaction.status === 'COMPLETED'
          ? newTransaction.type === 'INCOME'
            ? Number(newTransaction.amount)
            : -Number(newTransaction.amount)
          : 0;

      await tx.transaction.update({
        where: { id: newTransaction.id },
        data: TransactionMapper.toPrisma(newTransaction),
      });

      if (oldEffect !== 0) {
        await tx.account.update({
          where: { id: oldTransaction.accountId },
          data: { balance: { increment: -oldEffect } },
        });
      }

      if (newEffect !== 0) {
        await tx.account.update({
          where: { id: newTransaction.accountId },
          data: { balance: { increment: newEffect } },
        });
      }
    });
  }

  async deleteWithBalanceReversion(transaction: Transaction): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id: transaction.id },
      });

      if (transaction.status === 'COMPLETED') {
        const balanceDelta =
          transaction.type === 'INCOME'
            ? -Number(transaction.amount)
            : Number(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceDelta } },
        });
      }
    });
  }

  async toggleStatusWithBalanceUpdate(
    transactionId: string,
  ): Promise<Transaction> {
    const result = await this.prisma.$transaction(async (tx) => {
      const transactionData = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transactionData) {
        throw new Error('Transaction not found');
      }

      const oldStatus = transactionData.status;
      const newStatus = oldStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

      const balanceEffect =
        transactionData.type === 'INCOME'
          ? Number(transactionData.amount)
          : -Number(transactionData.amount);

      const balanceDelta =
        newStatus === 'COMPLETED' ? balanceEffect : -balanceEffect;

      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: newStatus },
      });

      await tx.account.update({
        where: { id: transactionData.accountId },
        data: { balance: { increment: balanceDelta } },
      });

      return updated;
    });

    return TransactionMapper.toEntity(result);
  }

  async getExpensesByCategoryReport(
    workspaceId: string,
    month: number,
    year: number,
  ): Promise<Array<{ categoryId: string | null; totalAmount: number }>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const aggregations = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        workspaceId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    return aggregations.map((item) => ({
      categoryId: item.categoryId,
      totalAmount: Number(item._sum.amount || 0),
    }));
  }

  async getCashFlowEvolutionReport(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{ date: string; income: number; expense: number; balance: number }>
  > {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
        type: {
          in: ['INCOME', 'EXPENSE'],
        },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const dailyMap = new Map<string, { income: bigint; expense: bigint }>();

    for (const transaction of transactions) {
      const dateKey = transaction.date.toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { income: 0n, expense: 0n });
      }

      const daily = dailyMap.get(dateKey)!;

      if (transaction.type === 'INCOME') {
        daily.income += transaction.amount;
      } else {
        daily.expense += transaction.amount;
      }
    }

    return Array.from(dailyMap.entries())
      .map(([date, { income, expense }]) => ({
        date,
        income: Number(income),
        expense: Number(expense),
        balance: Number(income - expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
