import { MoneyUtils } from '@utils/MoneyUtils';
import { TopExpensesByCategory } from '../valueObjects/TopExpensesByCategory';

export class TopExpensesByCategoryPresenter {
  static toHTTP(expense: TopExpensesByCategory) {
    return {
      category: expense.category,
      total: MoneyUtils.centsToDecimal(expense.total ?? 0),
    };
  }
}
