import { MoneyUtils } from '@utils/MoneyUtils';
import { Account } from '../entities/Account';

export class AccountPresenter {
  static toHTTP(account: Account) {
    return {
      id: account.id,
      workspaceId: account.workspaceId,
      name: account.name,
      type: account.type,
      balance: MoneyUtils.centsToDecimal(Number(account.balance)),
      icon: account.icon,
      color: account.color,
      closingDay: account.closingDay,
      dueDay: account.dueDay,
    };
  }
}
