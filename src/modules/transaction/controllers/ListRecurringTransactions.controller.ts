import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListRecurringTransactionsGateway } from '../gateways/ListRecurringTransactions.gateway';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { ListRecurringTransactionsService } from '../services/ListRecurringTransactions.service';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class ListRecurringTransactionsController {
  constructor(private readonly listService: ListRecurringTransactionsService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query(ListRecurringTransactionsGateway)
    @Query('page')
    page: string,
    @Query('pageSize') pageSize: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const result = await this.listService.execute({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      sub,
      workspaceId,
      activeOnly: activeOnly === 'true',
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { recurringTransactions } = result.value;

    return {
      recurringTransactions: recurringTransactions.map((rt) =>
        RecurringTransactionPresenter.toHTTP(rt),
      ),
    };
  }
}
