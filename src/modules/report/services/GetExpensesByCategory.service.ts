import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import {
  CategoryReportItem,
  ExpensesByCategoryDTO,
} from '../dto/ExpensesByCategoryDTO';

type Request = ExpensesByCategoryDTO & Pick<TokenPayloadSchema, 'sub'>;
type Response = CategoryReportItem[];

@Injectable()
export class GetExpensesByCategoryService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ month, year, sub }: Request): Promise<Response> {
    const aggregations =
      await this.transactionRepository.getExpensesByCategoryReport(
        sub,
        month,
        year,
      );

    const totalExpenses = aggregations.reduce(
      (acc: number, item) => acc + item.totalAmount,
      0,
    );

    const categoryIds = aggregations
      .map((item) => item.categoryId)
      .filter(Boolean) as string[];
    const categories = await this.categoryRepository.findManyByIds(categoryIds);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const result: CategoryReportItem[] = aggregations
      .map((item) => {
        const category = categoryMap.get(item.categoryId!);
        const amount = item.totalAmount;

        return {
          categoryId: item.categoryId!,
          categoryName: category?.name || 'Sem categoria',
          color: category?.color || '#999999',
          icon: category?.icon || '📦',
          totalAmount: amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        };
      })
      .sort(
        (a: CategoryReportItem, b: CategoryReportItem) =>
          b.totalAmount - a.totalAmount,
      );

    return result;
  }
}
