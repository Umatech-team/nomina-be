import { MoneyUtils } from '@utils/MoneyUtils';
import { TransactionSummary } from '../valueObjects/TransactionSummary';

export class TransactionSummaryPresenter {
  static toHTTP(transaction: TransactionSummary) {
    return {
      date: transaction.date,
      income: MoneyUtils.centsToDecimal(transaction.income), // Valor em decimal
      incomeFormatted: MoneyUtils.formatCents(transaction.income, 'BRL'), // Valor formatado
      expense: MoneyUtils.centsToDecimal(transaction.expense), // Valor em decimal
      expenseFormatted: MoneyUtils.formatCents(transaction.expense, 'BRL'), // Valor formatado
    };
  }
}
