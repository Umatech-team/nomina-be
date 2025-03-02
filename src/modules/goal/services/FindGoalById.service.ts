import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindGoalByIdDTO } from '../dto/FindGoalByIdDTO';
import { Goal } from '../entities/Goal';
import { GoalNotFoundError } from '../errors/GoalNotFoundError';
import { GoalRepository } from '../repositories/contracts/GoalRepository';

type Request = FindGoalByIdDTO & TokenPayloadSchema;

type Errors = GoalNotFoundError | UnauthorizedError;

type Response = {
  goal: Goal;
};

@Injectable()
export class FindGoalByIdService implements Service<Request, Errors, Response> {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({ sub, goalId }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    const goal = await this.goalRepository.findUniqueById(goalId);

    if (!goal) {
      return left(new GoalNotFoundError());
    }

    return right({
      goal,
    });
  }
}
