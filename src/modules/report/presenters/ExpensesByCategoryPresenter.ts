import { MoneyUtils } from '@utils/MoneyUtils';
import { CategoryReportItem } from '../dto/ExpensesByCategoryDTO';

export class ExpensesByCategoryPresenter {
  static toHTTP(items: CategoryReportItem[]) {
    return items.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      color: item.color,
      icon: item.icon,
      totalAmount: MoneyUtils.centsToDecimal(item.totalAmount),
      percentage: Math.round(item.percentage * 100) / 100, // 2 decimal places
    }));
  }
}
