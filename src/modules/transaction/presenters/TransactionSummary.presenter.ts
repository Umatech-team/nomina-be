import { MoneyUtils } from '@utils/MoneyUtils';
import { TransactionSummary } from '../valueObjects/TransactionSummary';

export class TransactionSummaryPresenter {
  static toHTTP(transaction: TransactionSummary) {
    return {
      date: transaction.date,
      income: MoneyUtils.centsToDecimal(transaction.income),
      expense: MoneyUtils.centsToDecimal(transaction.expense),
    };
  }
}
