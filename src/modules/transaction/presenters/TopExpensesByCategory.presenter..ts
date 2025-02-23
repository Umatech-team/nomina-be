import { TopExpensesByCategory } from '../valueObjects/TopExpensesByCategory';

export class TopExpensesByCategoryPresenter {
  static toHTTP(expense: TopExpensesByCategory) {
    return {
      category: expense.category,
      total: expense.total,
    };
  }
}
