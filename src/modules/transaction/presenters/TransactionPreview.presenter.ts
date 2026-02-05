import { Transaction } from '../entities/Transaction';

export class TransactionPreviewPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      type: transaction.type,
      description: transaction.description,
      categoryId: transaction.categoryId,
      amount: transaction.amountDecimal,
      date: transaction.date,
      status: transaction.status,
    };
  }
}
