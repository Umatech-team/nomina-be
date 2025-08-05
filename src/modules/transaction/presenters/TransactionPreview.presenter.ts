import { Transaction } from '../entities/Transaction';

export class TransactionPreviewPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      type: transaction.type,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amountDecimal,
      method: transaction.method,
      date: transaction.date,
    };
  }
}
