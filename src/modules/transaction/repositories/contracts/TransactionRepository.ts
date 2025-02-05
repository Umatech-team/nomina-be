import { Repository } from '@shared/core/contracts/Repository';
import { Transaction } from '../../entities/Transaction';

export abstract class TransactionRepository implements Repository<Transaction> {
  abstract create(transaction: Transaction): Promise<void>;
  abstract update(transaction: Transaction): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findUniqueById(id: number): Promise<Transaction | null>;
  abstract listTransactionsByMemberId(
    memberId: number,
    startDate: Date,
    endDate: Date,
    page: number,
    pageSize: number,
  ): Promise<Transaction[]>;
}
