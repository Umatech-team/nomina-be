import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionSummaryPresenter } from '../presenters/TransactionSummary.presenter';
import { ListTransactionSummaryByWorkspaceIdService } from '../services/FindTransactionSummaryByMemberId.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ListTransactionSummaryByWorkspaceIdController {
  constructor(
    private readonly listTransactionSummaryByWorkspaceIdService: ListTransactionSummaryByWorkspaceIdService,
  ) {}

  @Get('summary')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query('period') period: '7d' | '30d',
  ) {
    const result =
      await this.listTransactionSummaryByWorkspaceIdService.execute({
        sub,
        workspaceId,
        period,
      });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { summary } = result.value;

    return summary.map(TransactionSummaryPresenter.toHTTP);
  }
}
