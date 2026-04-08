import { Account } from '@modules/account/entities/Account';
import { AccountPresenter } from '@modules/account/presenters/Account.presenter';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { MoneyUtils } from '@utils/MoneyUtils';

interface CreditCardInvoiceData {
  account: Account;
  transactions: Transaction[];
  totalAmount: number;
  availableLimit: number | null;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
}

export class CreditCardInvoicePresenter {
  static toHTTP(data: CreditCardInvoiceData) {
    return {
      account: AccountPresenter.toHTTP(data.account),
      transactions: data.transactions.map(TransactionPresenter.toHTTP),
      totalAmount: MoneyUtils.centsToDecimal(data.totalAmount),
      availableLimit:
        data.availableLimit === null
          ? null
          : MoneyUtils.centsToDecimal(data.availableLimit),
      dueDate: data.dueDate.toISOString(),
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString(),
    };
  }
}
