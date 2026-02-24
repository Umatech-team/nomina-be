import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  BalanceEvolutionPipe,
  BalanceEvolutionRequest,
} from './get-balance-evolution.dto';
import { BalanceEvolutionHandler } from './get-balance-evolution.handler';

@ApiTags('Report')
@Controller('report')
export class BalanceEvolutionController {
  constructor(private readonly handler: BalanceEvolutionHandler) {}

  @Get('balance-evolution')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query(BalanceEvolutionPipe) query: BalanceEvolutionRequest,
  ) {
    const data = await this.handler.execute({
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
