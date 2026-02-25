import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { TransactionMapper } from '../mappers/transaction.mapper';
import * as schema from '../schema';

@Injectable()
export class TransactionRepositoryImplementation
  implements TransactionRepository
{
  constructor(private readonly drizzle: DrizzleService) {}
  async findUniqueById(id: string): Promise<Transaction | null> {
    const [transaction] = await this.drizzle.db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, id));

    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  listTransactionsByWorkspaceId(
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
    throw new Error('Method not implemented.');
  }

  getTopExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
    pageSize: number,
  ): Promise<TopExpensesByCategory[]> {
    throw new Error('Method not implemented.');
  }

  sumTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    throw new Error('Method not implemented.');
  }

  createWithBalanceUpdate(transaction: Transaction): Promise<void> {
    throw new Error('Method not implemented.');
  }

  updateWithBalanceUpdate(
    oldTransaction: Transaction,
    newTransaction: Transaction,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  deleteWithBalanceReversion(transaction: Transaction): Promise<void> {
    throw new Error('Method not implemented.');
  }

  toggleStatusWithBalanceUpdate(transactionId: string): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
}
