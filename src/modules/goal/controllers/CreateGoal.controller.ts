import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CreateGoalDTO } from '@modules/goal/dto/CreateGoalDTO';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateGoalGateway } from '../gateways/CreateGoal.gateway';
import { GoalPresenter } from '../presenters/Goal.presenter';
import { CreateGoalService } from '../services/CreateGoal.service';

@ApiTags('Goal')
@Controller('goal')
export class CreateGoalController {
  constructor(private readonly createGoalService: CreateGoalService) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(CreateGoalGateway) body: CreateGoalDTO,
  ) {
    const result = await this.createGoalService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { goal } = result.value;

    return {
      goal: GoalPresenter.toHTTP(goal),
    };
  }
}
