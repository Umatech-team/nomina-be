import { MoneyUtils } from '@utils/MoneyUtils';
import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

export class MonthlySummaryPresenter {
  static toHTTP(monthSummary: MonthSumarryWithPercentage) {
    return {
      id: monthSummary.id,
      memberId: monthSummary.memberId,
      month: monthSummary.month,
      totalIncome: MoneyUtils.centsToDecimal(monthSummary.totalIncome), // Valor em decimal
      totalIncomeFormatted: MoneyUtils.formatCents(
        monthSummary.totalIncome,
        'BRL',
      ), // Valor formatado
      totalExpense: MoneyUtils.centsToDecimal(monthSummary.totalExpense), // Valor em decimal
      totalExpenseFormatted: MoneyUtils.formatCents(
        monthSummary.totalExpense,
        'BRL',
      ), // Valor formatado
      totalInvestments: MoneyUtils.centsToDecimal(
        monthSummary.totalInvestments,
      ), // Valor em decimal
      totalInvestmentsFormatted: MoneyUtils.formatCents(
        monthSummary.totalInvestments,
        'BRL',
      ), // Valor formatado
      balance: MoneyUtils.centsToDecimal(monthSummary.balance), // Valor em decimal
      balanceFormatted: MoneyUtils.formatCents(monthSummary.balance, 'BRL'), // Valor formatado
      percentageChanges: monthSummary.percentageChanges,
    };
  }
}
