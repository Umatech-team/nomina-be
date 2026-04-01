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
    title?: string,
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
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void>;

  abstract updateWithBalanceUpdate(
    newTransaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
    oldDestinationAccountId?: string | null,
    oldDestinationNewBalance?: number,
  ): Promise<void>;

  abstract deleteWithBalanceReversion(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void>;

  abstract toggleStatusWithBalanceUpdate(
    transactionId: string,
    sourceNewBalance: number,
    destinationAccountId?: string | null,
    destinationNewBalance?: number,
  ): Promise<Transaction>;

  abstract findByAccountAndDateRange(
    accountId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>;
}
