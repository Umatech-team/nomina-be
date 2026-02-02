import { MoneyUtils } from '@utils/MoneyUtils';
import { CashFlowReportItem } from '../dto/CashFlowEvolutionDTO';

export class CashFlowEvolutionPresenter {
  static toHTTP(items: CashFlowReportItem[]) {
    return items.map((item) => ({
      date: item.date,
      income: MoneyUtils.centsToDecimal(item.income),
      expense: MoneyUtils.centsToDecimal(item.expense),
      balance: MoneyUtils.centsToDecimal(item.balance),
    }));
  }
}
