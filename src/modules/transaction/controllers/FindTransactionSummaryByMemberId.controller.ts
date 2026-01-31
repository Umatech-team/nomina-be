import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionSummaryPresenter } from '../presenters/TransactionSummary.presenter';
import { FindTransactionSummaryByUserIdService } from '../services/FindTransactionSummaryByUserId.service';

@ApiTags('Transaction')
@Controller('transaction/summary')
export class FindTransactionSummaryByUserIdController {
  constructor(
    private readonly findTransactionSummaryByUserIdService: FindTransactionSummaryByUserIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query('period') period: '7d' | '30d',
  ) {
    const result = await this.findTransactionSummaryByUserIdService.execute({
      sub,
      period,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { summary } = result.value;

    return summary.map(TransactionSummaryPresenter.toHTTP);
  }
}
