import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { MonthSummary } from '@modules/transaction/valueObjects/MonthSumarryWithPercentage';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

type Request = TokenPayloadBase;

type Errors = HttpException;

type Response = MonthSummary;

@Injectable()
export class FindMonthSummaryHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new HttpException('User not found', 404));
    }

    const now = new Date();

    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const previousMonthDate = subMonths(now, 1);
    const previousMonthStart = startOfMonth(previousMonthDate);
    const previousMonthEnd = endOfMonth(previousMonthDate);

    const currentMonthData =
      await this.transactionRepository.sumTransactionsByDateRange(
        workspaceId,
        currentMonthStart,
        currentMonthEnd,
      );

    const previousMonthData =
      await this.transactionRepository.sumTransactionsByDateRange(
        workspaceId,
        previousMonthStart,
        previousMonthEnd,
      );

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

    return right(monthSummary);
  }
}
