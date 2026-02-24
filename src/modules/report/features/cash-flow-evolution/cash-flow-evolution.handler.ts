import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import * as schema from '@infra/databases/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { MoneyUtils } from '@utils/MoneyUtils';
import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { CashFlowEvolutionRequest } from './cash-flow-evolution.dto';

type Request = CashFlowEvolutionRequest &
  Pick<TokenPayloadSchema, 'workspaceId'>;
type Response = Array<{
  date: string;
  income: number;
  expense: number;
  balance: number;
}>;

@Injectable()
export class CashFlowEvolutionHandler {
  constructor(private readonly drizzle: DrizzleService) {}

  async execute({
    workspaceId,
    startDate,
    endDate,
  }: Request): Promise<Response> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setUTCHours(23, 59, 59, 999);

    const dateFormatted = sql<string>`to_char(${schema.transactions.date}, 'YYYY-MM-DD')`;

    const incomes =
      sql<number>`COALESCE(SUM(CASE WHEN ${schema.transactions.type} = 'INCOME' THEN ${schema.transactions.amount} ELSE 0 END), 0)`.mapWith(
        Number,
      );
    const expenses =
      sql<number>`COALESCE(SUM(CASE WHEN ${schema.transactions.type} = 'EXPENSE' THEN ${schema.transactions.amount} ELSE 0 END), 0)`.mapWith(
        Number,
      );

    const aggregates = await this.drizzle.db
      .select({
        date: dateFormatted,
        income: incomes,
        expense: expenses,
        balance: sql<number>`(${incomes}) - (${expenses})`.mapWith(Number),
      })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.workspaceId, workspaceId),
          eq(schema.transactions.status, 'COMPLETED'),
          inArray(schema.transactions.type, ['INCOME', 'EXPENSE']),
          gte(schema.transactions.date, start),
          lte(schema.transactions.date, end),
        ),
      )
      .groupBy(dateFormatted)
      .orderBy(dateFormatted);

    return aggregates.map((item) => ({
      date: item.date,
      income: MoneyUtils.centsToDecimal(item.income),
      expense: MoneyUtils.centsToDecimal(item.expense),
      balance: MoneyUtils.centsToDecimal(item.balance),
    }));
  }
}
