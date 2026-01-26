import { MoneyUtils } from '@utils/MoneyUtils';
import { Transaction } from '../entities/Transaction';

export class TransactionPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id,
      workspaceId: transaction.workspaceId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      description: transaction.description,
      amount: MoneyUtils.centsToDecimal(Number(transaction.amount)),
      date: transaction.date,
      type: transaction.type,
      status: transaction.status,
      recurringId: transaction.recurringId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
