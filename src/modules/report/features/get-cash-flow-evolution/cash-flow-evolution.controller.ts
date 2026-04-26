import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  CashFlowEvolutionPipe,
  type CashFlowEvolutionRequest,
} from './cash-flow-evolution.dto';
import { CashFlowEvolutionService } from './cash-flow-evolution.handler';

@ApiTags('Report')
@Controller('report')
export class CashFlowEvolutionController {
  constructor(private readonly service: CashFlowEvolutionService) {}

  @Get('cash-flow-evolution')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Query(CashFlowEvolutionPipe) query: CashFlowEvolutionRequest,
  ) {
    const data = await this.service.execute({
      workspaceId,
      ...query,
    });

    return { data };
  }
}
