import { RedisService } from '@infra/cache/redis/RedisService';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { MonthSummary } from '@modules/transaction/valueObjects/MonthSumarryWithPercentage';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';

type Request = TokenPayloadBase;

type Errors = HttpException;

type Response = MonthSummary;

const CACHE_TTL = 5 * 60;

@Injectable()
export class FindMonthSummaryService implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly redisService: RedisService,
  ) {}

  async execute({ workspaceId }: Request): Promise<Either<Errors, Response>> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    const cacheKey = `report:month-summary:${workspaceId}:${year}-${month}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return right(
        MonthSummary.create({ ...parsed, month: new Date(parsed.month) }),
      );
    }

    const currentMonthStart = new Date(Date.UTC(year, month, 1));
    const currentMonthEnd = new Date(
      Date.UTC(year, month + 1, 0, 23, 59, 59, 999),
    );

    const previousMonthStart = new Date(Date.UTC(year, month - 1, 1));
    const previousMonthEnd = new Date(
      Date.UTC(year, month, 0, 23, 59, 59, 999),
    );

    const [currentMonthData, previousMonthData] = await Promise.all([
      this.transactionRepository.sumTransactionsByDateRange(
        workspaceId,
        currentMonthStart,
        currentMonthEnd,
      ),
      this.transactionRepository.sumTransactionsByDateRange(
        workspaceId,
        previousMonthStart,
        previousMonthEnd,
      ),
    ]);

    const calculatePercentageChange = (
      current: number,
      previous: number,
    ): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const monthSummary = MonthSummary.create({
      month: now,
      totalIncome: currentMonthData.totalIncome,
      totalExpense: currentMonthData.totalExpense,
      totalInvestments: 0, // will be implemented
      rate: {
        currentMonthSaving:
          currentMonthData.totalIncome > 0
            ? Math.round(
                ((currentMonthData.totalIncome -
                  currentMonthData.totalExpense) /
                  currentMonthData.totalIncome) *
                  100,
              )
            : 0,
        previousMonthCompareSaving: calculatePercentageChange(
          currentMonthData.totalIncome - currentMonthData.totalExpense,
          previousMonthData.totalIncome - previousMonthData.totalExpense,
        ),
      },
    });

    await this.redisService.set(
      cacheKey,
      JSON.stringify({
        month: monthSummary.month,
        totalIncome: monthSummary.totalIncome,
        totalExpense: monthSummary.totalExpense,
        totalInvestments: monthSummary.totalInvestments,
        rate: monthSummary.rate,
      }),
      CACHE_TTL,
    );

    return right(monthSummary);
  }
}
