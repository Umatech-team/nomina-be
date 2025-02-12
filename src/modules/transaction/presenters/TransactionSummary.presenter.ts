import { TransactionSummary } from '../valueObjects/TransactionSummary';

export class TransactionSummaryPresenter {
  static toHTTP(transaction: TransactionSummary) {
    return {
      date: transaction.date,
      income: transaction.income,
      expense: transaction.expense,
    };
  }
}
