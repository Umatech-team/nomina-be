import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import * as schema from '@infra/databases/drizzle/schema';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Either, left, right } from '@shared/core/errors/Either';
import { MoneyUtils } from '@utils/MoneyUtils';
import { and, eq, gte, lt, lte, sql } from 'drizzle-orm';
import { BalanceEvolutionRequest } from './get-balance-evolution.dto';

type Request = BalanceEvolutionRequest & TokenPayloadBase;
type Errors = HttpException;
type Response = Array<{
  date: string;
  income: number;
  expense: number;
  balance: number;
}>;

@Injectable()
export class BalanceEvolutionHandler {
  constructor(private readonly drizzle: DrizzleService) {}

  async execute({
    workspaceId,
    sub,
    period,
  }: Request): Promise<Either<Errors, Response>> {
    const userIsMemberOfWorkspace = await this.drizzle.db
      .select({
        id: schema.workspaceUsers.id,
      })
      .from(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.workspaceId, workspaceId),
          eq(schema.workspaceUsers.userId, sub),
        ),
      );

    if (userIsMemberOfWorkspace.length === 0) {
      return left(
        new UnauthorizedException('Usuario não tem acesso a esse workspace'),
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : 30));

    const dateFormatted =
      sql<string>`to_char(${schema.transactions.date}, 'YYYY-MM-DD')`.as(
        'date_formatted',
      );

    const incomes =
      sql<number>`COALESCE(SUM(CASE WHEN ${schema.transactions.type} = 'INCOME' THEN ${schema.transactions.amount} ELSE 0::numeric END), 0::numeric)`
        .mapWith(Number)
        .as('income_total');

    const expenses =
      sql<number>`COALESCE(SUM(CASE WHEN ${schema.transactions.type} = 'EXPENSE' THEN ${schema.transactions.amount} ELSE 0::numeric END), 0::numeric)`
        .mapWith(Number)
        .as('expense_total');

    const isCompleted = sql`${schema.transactions.status} = 'COMPLETED'`;

    const [openingBalanceResult, periodTransactions] = await Promise.all([
      this.drizzle.db
        .select({
          income: incomes,
          expense: expenses,
        })
        .from(schema.transactions)
        .where(
          and(
            eq(schema.transactions.workspaceId, workspaceId),
            isCompleted,
            lt(schema.transactions.date, startDate),
          ),
        ),

      this.drizzle.db
        .select({
          date: dateFormatted,
          income: incomes,
          expense: expenses,
        })
        .from(schema.transactions)
        .where(
          and(
            eq(schema.transactions.workspaceId, workspaceId),
            isCompleted,
            gte(schema.transactions.date, startDate),
            lte(schema.transactions.date, endDate),
          ),
        )
        .groupBy(dateFormatted),
    ]);

    let accumulatedBalance =
      openingBalanceResult[0].income - openingBalanceResult[0].expense;

    const transactionsMap = new Map(
      periodTransactions.map((t) => [
        t.date,
        { income: t.income, expense: t.expense },
      ]),
    );

    const summary = [];

    for (
      let d = new Date(startDate);
      d.getTime() <= endDate.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = d.toISOString().split('T')[0];
      const dayData = transactionsMap.get(dateKey) || { income: 0, expense: 0 };

      accumulatedBalance += dayData.income - dayData.expense;

      summary.push({
        date: dateKey,
        income: MoneyUtils.centsToDecimal(dayData.income),
        expense: MoneyUtils.centsToDecimal(dayData.expense),
        balance: MoneyUtils.centsToDecimal(accumulatedBalance),
      });
    }

    return right(summary);
  }
}
