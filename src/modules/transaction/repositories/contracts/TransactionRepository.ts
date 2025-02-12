import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
import { Repository } from '@shared/core/contracts/Repository';
import { Transaction } from '../../entities/Transaction';

export abstract class TransactionRepository implements Repository<Transaction> {
  abstract create(transaction: Transaction): Promise<void>;
  abstract update(transaction: Transaction): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findUniqueById(id: number): Promise<Transaction | null>;
  abstract listTransactionsByMemberId(
    memberId: number,
    page: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  abstract getTopExpensesByCategory(
    memberId: number,
    startDate: Date,
    endDate: Date,
    limit?: number,
  ): Promise<Map<string, number>>;

  abstract getMonthlySummary(
    memberId: number,
    currentMonth: Date,
  ): Promise<any>;

  abstract findTransactionSummaryByMemberId(
    memberId: number,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]>;

  abstract updateMonthlySummary(
    memberId: number,
    month: Date,
    totalIncome?: number,
    totalExpense?: number,
    totalInvestments?: number,
    balance?: number,
  ): Promise<void>;
}
