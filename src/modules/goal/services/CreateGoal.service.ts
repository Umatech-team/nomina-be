import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateGoalDTO } from '../dto/CreateGoalDTO';
import { Goal } from '../entities/Goal';
import { InsufficientBalanceError } from '../errors/InsufficienValueError';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { GoalRepository } from '../repositories/contracts/GoalRepository';

type Request = CreateGoalDTO & TokenPayloadSchema;
type Errors = UnauthorizedError | InsufficientBalanceError | InvalidAmountError;
type Response = {
  goal: Goal;
};

@Injectable()
export class CreateGoalService implements Service<Request, Errors, Response> {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    title,
    currentAmount,
    monthlyContribution,
    targetAmount,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    if (currentAmount <= 0 || targetAmount <= 0 || monthlyContribution <= 0) {
      return left(new InvalidAmountError());
    }

    const goal = new Goal({
      memberId: sub,
      title,
      currentAmount,
      monthlyContribution,
      targetAmount,
    });

    await this.goalRepository.create(goal);

    return right({
      goal,
    });
  }
}
