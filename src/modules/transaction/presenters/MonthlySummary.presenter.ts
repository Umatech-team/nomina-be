import { MoneyUtils } from '@utils/MoneyUtils';
import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

export class MonthlySummaryPresenter {
  static toHTTP(monthSummary: MonthSumarryWithPercentage) {
    return {
      id: monthSummary.id,
      userId: monthSummary.userId,
      month: monthSummary.month,
      totalIncome: MoneyUtils.centsToDecimal(monthSummary.totalIncome ?? 0),
      totalExpense: MoneyUtils.centsToDecimal(monthSummary.totalExpense ?? 0),
      totalInvestments: MoneyUtils.centsToDecimal(
        monthSummary.totalInvestments ?? 0,
      ),
      balance: MoneyUtils.centsToDecimal(monthSummary.balance ?? 0),
      percentageChanges: monthSummary.percentageChanges,
    };
  }
}
