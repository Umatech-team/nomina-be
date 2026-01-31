import { MonthSumarryWithPercentage } from '@modules/transaction/valueObjects/MonthSumarryWithPercentage';
import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
import { Repository } from '@shared/core/contracts/Repository';
import { Transaction } from '../../entities/Transaction';

export abstract class TransactionRepository implements Repository<Transaction> {
  abstract create(transaction: Transaction): Promise<void>;
  abstract update(transaction: Transaction): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findUniqueById(id: number): Promise<Transaction | null>;
  abstract listTransactionsByUserId(
    userId: number,
    page: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  abstract getTopExpensesByCategory(
    userId: number,
    startDate: Date,
    endDate: Date,
    pageSize: number,
  ): Promise<TopExpensesByCategory[]>;

  abstract getMonthlySummary(
    userId: number,
    currentMonth: Date,
  ): Promise<MonthSumarryWithPercentage>;

  abstract findTransactionSummaryByUserId(
    userId: number,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]>;

  abstract updateMonthlySummary(
    userId: number,
    month: Date,
    totalIncome?: number,
    totalExpense?: number,
    totalInvestments?: number,
    balance?: number,
  ): Promise<void>;
}
