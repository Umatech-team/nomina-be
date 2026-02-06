import { MoneyUtils } from '@utils/MoneyUtils';
import { MonthSummary } from '../valueObjects/MonthSumarryWithPercentage';

export class MonthSummaryPresenter {
  static toHTTP(monthSummary: MonthSummary) {
    return {
      month: monthSummary.month,
      totalIncome: MoneyUtils.centsToDecimal(monthSummary.totalIncome ?? 0),
      totalExpense: MoneyUtils.centsToDecimal(monthSummary.totalExpense ?? 0),
      currentMonthSaving: monthSummary.rate.currentMonthSaving,
      previousMonthCompareSaving: monthSummary.rate.previousMonthCompareSaving,
    };
  }
}
