import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import * as schema from '@infra/databases/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { DateProvider } from '@providers/date/contracts/DateProvider';
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
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute({ workspaceId, month, year }: Request): Promise<Response> {
    const workspaceTimezone = 'America/Sao_Paulo';
    const referenceDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const startDate = this.dateProvider.startOfMonth(
      referenceDateStr,
      workspaceTimezone,
    );
    const endDate = this.dateProvider.endOfMonth(
      referenceDateStr,
      workspaceTimezone,
    );

    const whereConditions = and(
      eq(schema.transactions.workspaceId, workspaceId),
      gte(schema.transactions.date, startDate),
      eq(schema.transactions.status, 'COMPLETED'),
      eq(schema.transactions.type, 'EXPENSE'),
      lte(schema.transactions.date, endDate),
    );

    const totalAmountSql =
      sql<number>`COALESCE(SUM(${schema.transactions.amount}), 0)`.mapWith(
        Number,
      );

    const [[{ grandTotal }], expenses] = await Promise.all([
      this.drizzle.db
        .select({ grandTotal: totalAmountSql })
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

    if (grandTotal === 0) return [];

    let sumOfTopCategories = 0;

    const result: Response = expenses.map((expense) => {
      sumOfTopCategories += expense.totalAmount;
      return {
        categoryId: expense.categoryId ?? 'uncategorized',
        categoryName: expense.categoryName ?? 'Sem Categoria',
        totalAmount: MoneyUtils.centsToDecimal(expense.totalAmount),
        percentage: Number(
          ((expense.totalAmount / grandTotal) * 100).toFixed(2),
        ),
      };
    });

    const othersAmount = grandTotal - sumOfTopCategories;

    if (othersAmount > 0) {
      result.push({
        categoryId: 'others',
        categoryName: 'Outros',
        totalAmount: MoneyUtils.centsToDecimal(othersAmount),
        percentage: Number(((othersAmount / grandTotal) * 100).toFixed(2)),
      });
    }

    return result;
  }
}
