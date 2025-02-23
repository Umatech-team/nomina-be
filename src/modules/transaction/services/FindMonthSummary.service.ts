import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
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
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({ sub }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthSummary = await this.transactionRepository.getMonthlySummary(
      member.id,
      currentMonth,
    );

    return right({
      monthSummary,
    });
  }
}
