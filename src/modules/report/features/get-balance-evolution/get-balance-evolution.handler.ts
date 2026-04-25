import { AccountType } from '@constants/enums';
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
import { and, eq, gte, lt, lte, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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
export class BalanceEvolutionService {
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

    const destAccount = alias(schema.accounts, 'dest_account');

    const sumAmount = sql<number>`SUM(${schema.transactions.amount})`
      .mapWith(Number)
      .as('total_amount');

    const isCompleted = eq(schema.transactions.status, 'COMPLETED');

    const isNotCreditCard = ne(
      schema.accounts.type,
      AccountType.CREDIT_CARD,
    );

    const isCreditCardInvoicePayment = and(
      eq(schema.transactions.type, 'TRANSFER'),
      eq(destAccount.type, AccountType.CREDIT_CARD),
    );

    const reportFilter = or(
      and(
        sql`${schema.transactions.type} IN ('INCOME', 'EXPENSE')`,
        isNotCreditCard,
      ),
      isCreditCardInvoicePayment,
    );

    const [openingBalanceResult, periodTransactions] = await Promise.all([
      this.drizzle.db
        .select({
          type: schema.transactions.type,
          destType: destAccount.type,
          amount: sumAmount,
        })
        .from(schema.transactions)
        .innerJoin(
          schema.accounts,
          eq(schema.transactions.accountId, schema.accounts.id),
        )
        .leftJoin(
          destAccount,
          eq(schema.transactions.destinationAccountId, destAccount.id),
        )
        .where(
          and(
            eq(schema.transactions.workspaceId, workspaceId),
            isCompleted,
            lt(schema.transactions.date, startDate),
            reportFilter,
          ),
        )
        .groupBy(schema.transactions.type, destAccount.type),

      this.drizzle.db
        .select({
          date: schema.transactions.date,
          type: schema.transactions.type,
          destType: destAccount.type,
          amount: sumAmount,
        })
        .from(schema.transactions)
        .innerJoin(
          schema.accounts,
          eq(schema.transactions.accountId, schema.accounts.id),
        )
        .leftJoin(
          destAccount,
          eq(schema.transactions.destinationAccountId, destAccount.id),
        )
        .where(
          and(
            eq(schema.transactions.workspaceId, workspaceId),
            isCompleted,
            gte(schema.transactions.date, startDate),
            lte(schema.transactions.date, endDate),
            reportFilter,
          ),
        )
        .groupBy(schema.transactions.date, schema.transactions.type, destAccount.type),
    ]);

    const resolveType = (type: string, destType: string | null) =>
      type === 'TRANSFER' && destType === AccountType.CREDIT_CARD
        ? 'EXPENSE'
        : type;

    let accumulatedBalance = 0;

    for (const res of openingBalanceResult) {
      const effectiveType = resolveType(res.type, res.destType);
      if (effectiveType === 'INCOME') accumulatedBalance += res.amount;
      if (effectiveType === 'EXPENSE') accumulatedBalance -= res.amount;
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

      const effectiveType = resolveType(transaction.type, transaction.destType);
      const summary = dailySummaryMap.get(dateKey)!;
      if (effectiveType === 'INCOME') summary.income += transaction.amount;
      if (effectiveType === 'EXPENSE') summary.expense += transaction.amount;
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
