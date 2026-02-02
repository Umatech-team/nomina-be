import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

type Request = TokenPayloadSchema;

type Errors = UnauthorizedError;

type Response = {
  monthSummary: MonthSumarryWithPercentage;
};

@Injectable()
export class FindMonthlySummaryWithPercentageService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ sub }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UnauthorizedError());
    }

    // TODO: Reimplementar getMonthlySummary sem userMonthlySummary table
    // Por enquanto, retornando valores vazios
    const monthSummary = new MonthSumarryWithPercentage({
      userId: 0, // TODO: fix this
      id: 0, // TODO: fix this
      month: new Date(),
      totalIncome: 0,
      totalExpense: 0,
      totalInvestments: 0,
      balance: 0,
      percentageChanges: {
        income: 0,
        expense: 0,
        balance: 0,
        investments: 0,
      },
    });

    return right({
      monthSummary,
    });
  }
}
