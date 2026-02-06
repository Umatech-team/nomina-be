import { MoneyUtils } from '@utils/MoneyUtils';
import { FinancialPositionResponse } from '../dto/FinancialPositionDTO';

export class FinancialPositionPresenter {
  static toHTTP(data: FinancialPositionResponse) {
    return {
      totalBalance: MoneyUtils.centsToDecimal(data.totalBalance),
      accounts: data.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: MoneyUtils.centsToDecimal(account.balance),
        icon: account.icon,
        color: account.color,
      })),
    };
  }
}
