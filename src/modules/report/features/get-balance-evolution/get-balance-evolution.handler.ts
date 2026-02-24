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
        workspaceId: schema.workspaceUsers.workspaceId,
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

    const sumAmount = sql<number>`SUM(${schema.transactions.amount})`
      .mapWith(Number)
      .as('total_amount');

    const isCompleted = eq(schema.transactions.status, 'COMPLETED');

    const [openingBalanceResult, periodTransactions] = await Promise.all([
      this.drizzle.db
        .select({
          type: schema.transactions.type,
          amount: sumAmount,
        })
        .from(schema.transactions)
        .where(
          and(
            eq(schema.transactions.workspaceId, workspaceId),
            isCompleted,
            lt(schema.transactions.date, startDate),
          ),
        )
        .groupBy(schema.transactions.type),

      this.drizzle.db
        .select({
          date: schema.transactions.date,
          type: schema.transactions.type,
          amount: sumAmount,
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
        .groupBy(schema.transactions.date, schema.transactions.type),
    ]);

    let accumulatedBalance = 0;

    for (const res of openingBalanceResult) {
      if (res.type === 'INCOME') accumulatedBalance += res.amount;
      if (res.type === 'EXPENSE') accumulatedBalance -= res.amount;
    }

    const dailySummaryMap = new Map<
      string,
      { income: number; expense: number }
    >();

    for (
      let d = new Date(startDate);
      d.getTime() <= endDate.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().split('T')[0];
      dailySummaryMap.set(key, { income: 0, expense: 0 });
    }

    for (const transaction of periodTransactions) {
      const dateKey = transaction.date.toISOString().split('T')[0];

      if (!dailySummaryMap.has(dateKey)) continue;

      const summary = dailySummaryMap.get(dateKey)!;
      if (transaction.type === 'INCOME') summary.income += transaction.amount;
      if (transaction.type === 'EXPENSE') summary.expense += transaction.amount;
    }

    const summaryResult = [];

    for (const [dateKey, dayData] of dailySummaryMap.entries()) {
      accumulatedBalance += dayData.income - dayData.expense;

      summaryResult.push({
        date: dateKey,
        income: MoneyUtils.centsToDecimal(dayData.income),
        expense: MoneyUtils.centsToDecimal(dayData.expense),
        balance: MoneyUtils.centsToDecimal(accumulatedBalance),
      });
    }

    return right(summaryResult);
  }
}
