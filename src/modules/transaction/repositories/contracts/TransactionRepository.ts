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
    userId: string,
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

  abstract findTransactionSummaryByUserId(
    userId: string,
    period: '7d' | '30d',
  ): Promise<TransactionSummary[]>;
}
