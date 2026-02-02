import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import {
  CategoryReportItem,
  ExpensesByCategoryDTO,
} from '../dto/ExpensesByCategoryDTO';

type Request = ExpensesByCategoryDTO & Pick<TokenPayloadSchema, 'sub'>;
type Response = CategoryReportItem[];

@Injectable()
export class GetExpensesByCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ month, year, sub }: Request): Promise<Response> {
    // 1. Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 2. Aggregate transactions by category (Prisma groupBy)
    const aggregations = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        workspaceId: sub,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED', // Only completed transactions
      },
      _sum: {
        amount: true,
      },
    });

    // 3. Calculate total
    const totalExpenses = aggregations.reduce(
      (acc: number, item) => acc + Number(item._sum.amount || 0),
      0,
    );

    // 4. Fetch category details (avoid N+1)
    const categoryIds = aggregations
      .map((item) => item.categoryId)
      .filter(Boolean) as string[];
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    // 5. Map to response format
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const result: CategoryReportItem[] = aggregations
      .map((item) => {
        const category = categoryMap.get(item.categoryId!);
        const amount = Number(item._sum.amount || 0);

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
      ); // Sort by amount DESC

    return result;
  }
}
