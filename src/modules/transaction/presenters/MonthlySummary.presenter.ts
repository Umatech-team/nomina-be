import { MoneyUtils } from '@utils/MoneyUtils';
import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

export class MonthlySummaryPresenter {
  static toHTTP(monthSummary: MonthSumarryWithPercentage) {
    return {
      id: monthSummary.id,
      memberId: monthSummary.memberId,
      month: monthSummary.month,
      totalIncome: MoneyUtils.centsToDecimal(monthSummary.totalIncome),
      totalExpense: MoneyUtils.centsToDecimal(monthSummary.totalExpense),
      totalInvestments: MoneyUtils.centsToDecimal(
        monthSummary.totalInvestments,
      ),
      balance: MoneyUtils.centsToDecimal(monthSummary.balance),
      percentageChanges: monthSummary.percentageChanges,
    };
  }
}
