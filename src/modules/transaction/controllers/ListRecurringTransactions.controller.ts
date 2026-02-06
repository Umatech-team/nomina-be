import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListRecurringTransactionsGateway } from '../gateways/ListRecurringTransactions.gateway';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { ListRecurringTransactionsService } from '../services/ListRecurringTransactions.service';

interface ListRecurringTransactionsQuery {
  page: number;
  pageSize: number;
}

@ApiTags('Recurring Transaction')
@Controller('recurring-transaction')
export class ListRecurringTransactionsController {
  constructor(private readonly listService: ListRecurringTransactionsService) {}

  @Get('list')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query(ListRecurringTransactionsGateway)
    query: ListRecurringTransactionsQuery,
  ) {
    const result = await this.listService.execute({
      ...query,
      sub,
      workspaceId,
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
