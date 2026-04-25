import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import * as schema from '@infra/databases/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { MoneyUtils } from '@utils/MoneyUtils';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { GetExpensesByCategoryRequest } from './get-expenses-by-category.dto';

type Request = GetExpensesByCategoryRequest &
  Pick<TokenPayloadSchema, 'workspaceId'>;
type Response = Array<{
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}>;

const TOP_CATEGORIES_LIMIT = 5;

@Injectable()
export class GetExpensesByCategoryService {
  constructor(private readonly drizzle: DrizzleService) {}

  async execute({ workspaceId, month, year }: Request): Promise<Response> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const whereConditions = and(
      eq(schema.transactions.workspaceId, workspaceId),
      eq(schema.transactions.status, 'COMPLETED'),
      eq(schema.transactions.type, 'EXPENSE'),
      gte(schema.transactions.date, startDate),
      lte(schema.transactions.date, endDate),
    );

    const totalAmountSql =
      sql<number>`COALESCE(SUM(${schema.transactions.amount}), 0)`.mapWith(
        Number,
      );

    const [[{ grandTotal }], expenses] = await Promise.all([
      this.drizzle.db
        .select({
          grandTotal:
            sql<number>`COALESCE(SUM(${schema.transactions.amount}), 0)`.mapWith(
              Number,
            ),
        })
        .from(schema.transactions)
        .where(whereConditions),
      this.drizzle.db
        .select({
          categoryId: schema.categories.id,
          categoryName: schema.categories.name,
          totalAmount: totalAmountSql,
        })
        .from(schema.transactions)
        .leftJoin(
          schema.categories,
          eq(schema.transactions.categoryId, schema.categories.id),
        )
        .where(whereConditions)
        .groupBy(schema.categories.id, schema.categories.name)
        .orderBy(desc(totalAmountSql))
        .limit(TOP_CATEGORIES_LIMIT),
    ]);

    return expenses.map((expense) => ({
      categoryId: expense.categoryId ?? 'uncategorized',
      categoryName: expense.categoryName ?? 'Sem Categoria',
      totalAmount: MoneyUtils.centsToDecimal(expense.totalAmount),
      percentage:
        grandTotal > 0
          ? Number(((expense.totalAmount / grandTotal) * 100).toFixed(2))
          : 0,
    }));
  }
}
