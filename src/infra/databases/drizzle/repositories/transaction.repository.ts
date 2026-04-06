import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, isNotNull, like, lte, sum } from 'drizzle-orm';
import { TransactionMapper } from '../mappers/transaction.mapper';
import * as schema from '../schema';

@Injectable()
export class TransactionRepositoryImplementation implements TransactionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findUniqueById(id: string): Promise<Transaction | null> {
    const [transaction] = await this.drizzle.db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, id))
      .limit(1);

    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async listTransactionsByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
    type?: string,
    categoryId?: string,
    accountId?: string,
    title?: string,
    status?: string,
  ): Promise<Transaction[]> {
    const transactions = await this.drizzle.db
      .select()
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.workspaceId, workspaceId),
          startDate ? gte(schema.transactions.date, startDate) : undefined,
          endDate ? lte(schema.transactions.date, endDate) : undefined,
          type ? eq(schema.transactions.type, type) : undefined,
          categoryId
            ? eq(schema.transactions.categoryId, categoryId)
            : undefined,
          accountId ? eq(schema.transactions.accountId, accountId) : undefined,
          title ? like(schema.transactions.title, `%${title}%`) : undefined,
          status ? eq(schema.transactions.status, status) : undefined,
        ),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(schema.transactions.date));

    return transactions.map(TransactionMapper.toDomain);
  }

  async getTopExpensesByCategory(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    pageSize: number,
  ): Promise<TopExpensesByCategory[]> {
    const results = await this.drizzle.db
      .select({
        categoryId: schema.transactions.categoryId,
        categoryName: schema.categories.name,
        totalAmount: sum(schema.transactions.amount).mapWith(Number),
      })
      .from(schema.transactions)
      .innerJoin(
        schema.categories,
        eq(schema.categories.id, schema.transactions.categoryId),
      )
      .where(
        and(
          eq(schema.transactions.workspaceId, workspaceId),
          eq(schema.transactions.type, 'EXPENSE'),
          isNotNull(schema.transactions.categoryId),
          gte(schema.transactions.date, startDate),
          lte(schema.transactions.date, endDate),
        ),
      )
      .groupBy(schema.transactions.categoryId, schema.categories.name)
      .orderBy(desc(sum(schema.transactions.amount)))
      .limit(pageSize);

    return results.map(
      (r) =>
        new TopExpensesByCategory({
          categoryId: r.categoryId!,
          categoryName: r.categoryName,
          amount: r.totalAmount,
        }),
    );
  }

  async sumTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const results = await this.drizzle.db
      .select({
        type: schema.transactions.type,
        total: sum(schema.transactions.amount).mapWith(Number),
      })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.workspaceId, workspaceId),
          gte(schema.transactions.date, startDate),
          lte(schema.transactions.date, endDate),
        ),
      )
      .groupBy(schema.transactions.type);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const row of results) {
      if (row.type === 'INCOME') totalIncome += row.total;
      if (row.type === 'EXPENSE') totalExpense += row.total;
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async createWithBalanceUpdate(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .insert(schema.transactions)
        .values(TransactionMapper.toDatabase(transaction));

      await tx
        .update(schema.accounts)
        .set({ balance: sourceNewBalance })
        .where(eq(schema.accounts.id, transaction.accountId));

      if (transaction.destinationAccountId && destinationNewBalance !== undefined) {
        await tx
          .update(schema.accounts)
          .set({ balance: destinationNewBalance })
          .where(eq(schema.accounts.id, transaction.destinationAccountId));
      }
    });
  }

  async updateWithBalanceUpdate(
    newTransaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
    oldDestinationAccountId?: string | null,
    oldDestinationNewBalance?: number,
    oldSourceAccountId?: string,
    oldSourceNewBalance?: number,
  ): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .update(schema.transactions)
        .set(TransactionMapper.toDatabase(newTransaction))
        .where(eq(schema.transactions.id, newTransaction.id));

      await tx
        .update(schema.accounts)
        .set({ balance: sourceNewBalance })
        .where(eq(schema.accounts.id, newTransaction.accountId));

      if (oldSourceAccountId && oldSourceNewBalance !== undefined) {
        await tx
          .update(schema.accounts)
          .set({ balance: oldSourceNewBalance })
          .where(eq(schema.accounts.id, oldSourceAccountId));
      }

      if (oldDestinationAccountId && oldDestinationNewBalance !== undefined) {
        await tx
          .update(schema.accounts)
          .set({ balance: oldDestinationNewBalance })
          .where(eq(schema.accounts.id, oldDestinationAccountId));
      }

      if (
        newTransaction.destinationAccountId &&
        destinationNewBalance !== undefined &&
        newTransaction.destinationAccountId !== oldDestinationAccountId
      ) {
        await tx
          .update(schema.accounts)
          .set({ balance: destinationNewBalance })
          .where(eq(schema.accounts.id, newTransaction.destinationAccountId));
      }
    });
  }

  async deleteWithBalanceReversion(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .delete(schema.transactions)
        .where(eq(schema.transactions.id, transaction.id));

      await tx
        .update(schema.accounts)
        .set({ balance: sourceNewBalance })
        .where(eq(schema.accounts.id, transaction.accountId));

      if (transaction.destinationAccountId && destinationNewBalance !== undefined) {
        await tx
          .update(schema.accounts)
          .set({ balance: destinationNewBalance })
          .where(eq(schema.accounts.id, transaction.destinationAccountId));
      }
    });
  }

  async toggleStatusWithBalanceUpdate(
    transactionId: string,
    sourceNewBalance: number,
    destinationAccountId?: string | null,
    destinationNewBalance?: number,
  ): Promise<Transaction> {
    return await this.drizzle.db.transaction(async (tx) => {
      const [current] = await tx
        .select({
          status: schema.transactions.status,
          accountId: schema.transactions.accountId,
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.id, transactionId))
        .limit(1);

      if (!current) throw new Error('Transaction not found');

      const newStatus =
        current.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

      const [updatedTransaction] = await tx
        .update(schema.transactions)
        .set({ status: newStatus })
        .where(eq(schema.transactions.id, transactionId))
        .returning();

      await tx
        .update(schema.accounts)
        .set({ balance: sourceNewBalance })
        .where(eq(schema.accounts.id, current.accountId));

      if (destinationAccountId && destinationNewBalance !== undefined) {
        await tx
          .update(schema.accounts)
          .set({ balance: destinationNewBalance })
          .where(eq(schema.accounts.id, destinationAccountId));
      }

      return TransactionMapper.toDomain(updatedTransaction);
    });
  }

  async findByAccountAndDateRange(
    accountId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const rows = await this.drizzle.db
      .select()
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.accountId, accountId),
          eq(schema.transactions.workspaceId, workspaceId),
          gte(schema.transactions.date, startDate),
          lte(schema.transactions.date, endDate),
        ),
      )
      .orderBy(desc(schema.transactions.date));

    return rows.map(TransactionMapper.toDomain);
  }
}
