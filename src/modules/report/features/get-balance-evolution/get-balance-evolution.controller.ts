import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    BalanceEvolutionPipe,
    type BalanceEvolutionRequest,
} from './get-balance-evolution.dto';
import { BalanceEvolutionService } from './get-balance-evolution.service';

@ApiTags('Report')
@Controller('report')
export class BalanceEvolutionController {
  constructor(private readonly service: BalanceEvolutionService) {}

  @Get('balance-evolution')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query(BalanceEvolutionPipe) query: BalanceEvolutionRequest,
  ) {
    const data = await this.service.execute({
      workspaceId,
      sub,
      ...query,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
