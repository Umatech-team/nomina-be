import { MoneyUtils } from '@utils/MoneyUtils';
import { RecurringTransaction } from '../entities/RecurringTransaction';

export class RecurringTransactionPresenter {
  static toHTTP(recurringTransaction: RecurringTransaction) {
    return {
      id: recurringTransaction.id,
      workspaceId: recurringTransaction.workspaceId,
      accountId: recurringTransaction.accountId,
      categoryId: recurringTransaction.categoryId,
      description: recurringTransaction.description,
      amount: MoneyUtils.centsToDecimal(Number(recurringTransaction.amount)),
      frequency: recurringTransaction.frequency,
      interval: recurringTransaction.interval,
      startDate: recurringTransaction.startDate,
      endDate: recurringTransaction.endDate,
      lastGenerated: recurringTransaction.lastGenerated,
      active: recurringTransaction.active,
    };
  }
}
