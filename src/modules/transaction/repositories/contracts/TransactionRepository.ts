import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { Transaction } from '../../entities/Transaction';

export abstract class TransactionRepository {
  abstract findUniqueById(id: string): Promise<Transaction | null>;
  abstract listTransactionsByWorkspaceId(
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
  ): Promise<Transaction[]>;

  abstract getTopExpensesByCategory(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    pageSize: number,
  ): Promise<TopExpensesByCategory[]>;

  abstract sumTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;

  abstract createWithBalanceUpdate(
    transaction: Transaction,
    newBalance: number,
  ): Promise<void>;

  abstract updateWithBalanceUpdate(
    newTransaction: Transaction,
    newBalance: number,
  ): Promise<void>;

  abstract deleteWithBalanceReversion(
    transaction: Transaction,
    newBalance: number,
  ): Promise<void>;

  abstract toggleStatusWithBalanceUpdate(
    transactionId: string,
    newBalance: number,
  ): Promise<Transaction>;
}
