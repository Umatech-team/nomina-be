import { CheckingAccount } from '@modules/account/entities/CheckingAccount';
import { AnyAccount } from '@modules/account/entities/types';
import { MoneyUtils } from '@utils/MoneyUtils';
import { CashAccount } from '../entities/CashAccounts';
import { CreditCard } from '../entities/CreditCardAccount';

export class AccountPresenter {
  static toHTTP(account: AnyAccount) {
    const basePayload = {
      id: account.id,
      workspaceId: account.workspaceId,
      name: account.name,
      type: account.type,
      balance: MoneyUtils.centsToDecimal(Number(account.balance)),
    };

    if (account instanceof CreditCard) {
      return {
        ...basePayload,
        closingDay: account.closingDay,
        dueDay: account.dueDay,
        creditLimit: MoneyUtils.centsToDecimal(Number(account.creditLimit)),
        availableLimit: MoneyUtils.centsToDecimal(
          Number(account.availableLimit),
        ),
      };
    }

    if (account instanceof CheckingAccount || account instanceof CashAccount) {
      return basePayload;
    }

    return basePayload;
  }
}
