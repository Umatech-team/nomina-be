import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionSummaryPresenter } from '../presenters/TransactionSummary.presenter';
import { FindTransactionSummaryByMemberIdService } from '../services/FindTransactionSummaryByMemberId.service';

@ApiTags('Transaction')
@Controller('transaction/summary')
export class FindTransactionSummaryByMemberIdController {
  constructor(
    private readonly findTransactionSummaryByMemberIdService: FindTransactionSummaryByMemberIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Query('period') period: '7d' | '30d',
  ) {
    const result = await this.findTransactionSummaryByMemberIdService.execute({
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
