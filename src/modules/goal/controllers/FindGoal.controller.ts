import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindGoalByIdDTO } from '../dto/FindGoalByIdDTO';
import { CreateGoalGateway } from '../gateways/CreateGoal.gateway';
import { GoalPresenter } from '../presenters/Goal.presenter';
import { FindGoalByIdService } from '../services/FindGoalById.service';

@ApiTags('Goal')
@Controller('goal')
export class FindGoalController {
  constructor(private readonly findGoalByIdService: FindGoalByIdService) {}

  @Get('find')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(CreateGoalGateway) body: FindGoalByIdDTO,
  ) {
    const result = await this.findGoalByIdService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { goal } = result.value;

    return GoalPresenter.toHTTP(goal);
  }
}
