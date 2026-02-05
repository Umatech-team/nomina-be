import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
import { Repository } from '@shared/core/contracts/Repository';
import { Transaction } from '../../entities/Transaction';

export abstract class TransactionRepository implements Repository<Transaction> {
  abstract create(transaction: Transaction): Promise<void>;
  abstract update(transaction: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findUniqueById(id: string): Promise<Transaction | null>;
  abstract listTransactionsByUserId(
    workspaceId: string,
    page: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  abstract getTopExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
    pageSize: number,
  ): Promise<TopExpensesByCategory[]>;

  abstract listTransactionsSummaryByWorkspaceId(
    workspaceId: string,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]>;

  abstract sumTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;

  abstract createWithBalanceUpdate(transaction: Transaction): Promise<void>;
  abstract updateWithBalanceUpdate(
    oldTransaction: Transaction,
    newTransaction: Transaction,
  ): Promise<void>;

  abstract deleteWithBalanceReversion(transaction: Transaction): Promise<void>;
  abstract toggleStatusWithBalanceUpdate(
    transactionId: string,
  ): Promise<Transaction>;

  abstract getExpensesByCategoryReport(
    workspaceId: string,
    month: number,
    year: number,
  ): Promise<
    Array<{
      categoryId: string | null;
      totalAmount: number;
    }>
  >;

  abstract getCashFlowEvolutionReport(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      date: string;
      income: number;
      expense: number;
      balance: number;
    }>
  >;
}
