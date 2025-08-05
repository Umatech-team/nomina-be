import { MoneyUtils } from '@utils/MoneyUtils';
import { Transaction } from '../entities/Transaction';

export class TransactionPreviewPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      type: transaction.type,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amountDecimal, // Valor em decimal ao invés de centavos
      amountFormatted: MoneyUtils.formatCents(
        transaction.amount,
        transaction.currency,
      ), // Valor formatado para exibição
      method: transaction.method,
      date: transaction.date,
    };
  }
}
