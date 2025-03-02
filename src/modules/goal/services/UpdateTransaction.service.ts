import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindGoalByIdDTO } from '../dto/FindGoalByIdDTO';
import { UpdateGoalDTO } from '../dto/UpdateGoalDTO';
import { Goal } from '../entities/Goal';
import { GoalNotFoundError } from '../errors/GoalNotFoundError';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { GoalRepository } from '../repositories/contracts/GoalRepository';

type Request = FindGoalByIdDTO & UpdateGoalDTO & TokenPayloadSchema;

type Errors = UnauthorizedError | InvalidAmountError | GoalNotFoundError;

type Response = {
  goal: Goal;
  newGoal: number;
};
@Injectable()
export class UpdateGoalService implements Service<Request, Errors, Response> {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    goalId,
    currentAmount,
    monthlyContribution,
    targetAmount,
    title,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    const goal = await this.goalRepository.findUniqueById(goalId);

    if (!goal) {
      return left(new GoalNotFoundError());
    }

    if (goal.memberId !== sub) {
      return left(new UnauthorizedError());
    }

    if (currentAmount <= 0 || targetAmount <= 0 || monthlyContribution <= 0) {
      return left(new InvalidAmountError());
    }

    goal.title = title;
    goal.currentAmount = currentAmount;
    goal.monthlyContribution = monthlyContribution;
    goal.targetAmount = targetAmount;

    await this.goalRepository.update(goal);

    return right({
      goal,
      newGoal: member.balance,
    });
  }
}
