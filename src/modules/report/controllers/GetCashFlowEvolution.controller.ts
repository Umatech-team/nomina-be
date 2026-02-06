import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { CashFlowEvolutionDTO } from '../dto/CashFlowEvolutionDTO';
import { GetCashFlowEvolutionGateway } from '../gateways/GetCashFlowEvolution.gateway';
import { CashFlowEvolutionPresenter } from '../presenters/CashFlowEvolutionPresenter';
import { GetCashFlowEvolutionService } from '../services/GetCashFlowEvolution.service';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { statusCode } from '@shared/core/types/statusCode';

@ApiTags('Report')
@Controller('report')
export class GetCashFlowEvolutionController {
  constructor(
    private readonly getCashFlowEvolutionService: GetCashFlowEvolutionService,
  ) {}

  @Get('cash-flow-evolution')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(GetCashFlowEvolutionGateway) query: CashFlowEvolutionDTO,
  ) {
    const result = await this.getCashFlowEvolutionService.execute({
      ...query,
      sub,
    });

    return {
      data: CashFlowEvolutionPresenter.toHTTP(result),
    };
  }
}
