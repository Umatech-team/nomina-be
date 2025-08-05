import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { MoneyUtils } from '@utils/MoneyUtils';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateGoalDTO } from '../dto/UpdateGoalDTO';
import { UpdateGoalGateway } from '../gateways/UpdateGoal.gateway';
import { GoalPresenter } from '../presenters/Goal.presenter';
import { UpdateGoalService } from '../services/UpdateTransaction.service';

@ApiTags('Goal')
@Controller('goal')
export class UpdateGoalController {
  constructor(private readonly updateGoalService: UpdateGoalService) {}

  @Patch('update')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(UpdateGoalGateway)
    body: UpdateGoalDTO,
  ) {
    const result = await this.updateGoalService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { goal, newGoal } = result.value;

    return {
      goal: GoalPresenter.toHTTP(goal),
      newBalance: MoneyUtils.centsToDecimal(newGoal), // Formatado de centavos para decimal
      newBalanceFormatted: MoneyUtils.formatCents(newGoal, 'BRL'), // Formatado para exibição
    };
  }
}
