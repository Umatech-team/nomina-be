import { Transaction } from '../entities/Transaction';

export class TransactionPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      memberId: transaction.memberId,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      currency: transaction.currency,
      date: transaction.date,
    };
  }
}
