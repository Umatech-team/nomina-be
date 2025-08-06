import { MoneyUtils } from '@utils/MoneyUtils';
import { TransactionSummary } from '../valueObjects/TransactionSummary';

export class TransactionSummaryPresenter {
  static toHTTP(transaction: TransactionSummary) {
    return {
      date: transaction.date,
      income: MoneyUtils.centsToDecimal(transaction.income ?? 0),
      expense: MoneyUtils.centsToDecimal(transaction.expense ?? 0),
    };
  }
}
