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

  async listTransactionsByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
    type?: string,
    categoryId?: string,
    accountId?: string,
    description?: string,
    status?: string,
  ): Promise<Transaction[]> {
    const where: Record<string, unknown> = {
      workspaceId,
      ...(startDate &&
        endDate && {
          date: { gte: startDate, lte: endDate },
        }),
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId }),
      ...(description && {
        description: { contains: description, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: 'desc' },
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

    const [openingBalanceResult, periodTransactions] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: {
          workspaceId,
          status: 'COMPLETED',
          date: { lt: startDate },
        },
        _sum: { amount: true },
      }),

      this.prisma.transaction.groupBy({
        by: ['date', 'type'],
        where: {
          workspaceId,
          date: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    let startIncome = 0;
    let startExpense = 0;

    openingBalanceResult.forEach((res) => {
      const val = Number(res._sum.amount || 0);
      if (res.type === 'INCOME') startIncome += val;
      if (res.type === 'EXPENSE') startExpense += val;
    });

    let accumulatedBalance = startIncome - startExpense;

    const dailySummaryMap = new Map<
      string,
      { income: number; expense: number; date: Date }
    >();

    for (
      let d = new Date(startDate);
      d.getTime() <= endDate.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().split('T')[0];
      dailySummaryMap.set(key, { income: 0, expense: 0, date: new Date(d) });
    }

    periodTransactions.forEach((transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      const amount = Number(transaction._sum?.amount ?? 0);

      if (!dailySummaryMap.has(dateKey)) return;

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

    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        workspaceId,
        status: 'COMPLETED',
        date: { gte: normalizedStartDate, lte: normalizedEndDate },
      },
      _sum: {
        amount: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach((group) => {
      const amount = Number(group._sum.amount || 0);

      if (group.type === 'INCOME') {
        totalIncome = amount;
      } else if (group.type === 'EXPENSE') {
        totalExpense = amount;
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
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
    const aggregates = await this.prisma.transaction.groupBy({
      by: ['date', 'type'],
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
      _sum: {
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const dailyMap = new Map<string, { income: number; expense: number }>();

    for (const item of aggregates) {
      const dateKey = item.date.toISOString().split('T')[0];

      const amount = Number(item._sum.amount || 0);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { income: 0, expense: 0 });
      }

      const entry = dailyMap.get(dateKey)!;

      if (item.type === 'INCOME') {
        entry.income += amount;
      } else {
        entry.expense += amount;
      }
    }

    return Array.from(dailyMap.entries())
      .map(([date, { income, expense }]) => ({
        date,
        income,
        expense,
        balance: income - expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
