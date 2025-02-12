import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

export class MonthlySummaryPresenter {
  static toHTTP(monthSummary: MonthSumarryWithPercentage) {
    return {
      id: monthSummary.id,
      memberId: monthSummary.memberId,
      month: monthSummary.month,
      totalIncome: monthSummary.totalIncome,
      totalExpense: monthSummary.totalExpense,
      totalInvestments: monthSummary.totalInvestments,
      balance: monthSummary.balance,
      percentageChanges: monthSummary.percentageChanges,
    };
  }
}
