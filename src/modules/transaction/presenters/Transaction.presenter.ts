import { Transaction } from '../entities/Transaction';

export class TransactionPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      title: transaction.title,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      memberId: transaction.memberId,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category,
      subCategory: transaction.subCategory,
      amount: transaction.amountDecimal, // Valor em decimal
      method: transaction.method,
      currency: transaction.currency,
      date: transaction.date,
    };
  }
}
