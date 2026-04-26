import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPreviewPresenter } from '@modules/transaction/presenters/TransactionPreview.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  ListTransactionsPipe,
  type ListTransactionsRequest,
} from './list-transaction.dto';
import { ListTransactionsService } from './list-transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ListTransactionController {
  constructor(private readonly service: ListTransactionsService) {}

  @Get('list')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query(ListTransactionsPipe)
    {
      page,
      pageSize,
      startDate,
      endDate,
      type,
      categoryId,
      accountId,
      title,
      status,
    }: ListTransactionsRequest,
  ) {
    const data = await this.service.execute({
      page,
      pageSize,
      startDate,
      endDate,
      sub,
      workspaceId,
      type,
      categoryId,
      accountId,
      title,
      status,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: {
        transactions: data.value.transactions.map((transaction) =>
          TransactionPreviewPresenter.toHTTP(transaction),
        ),
        total: data.value.total,
      },
    };
  }
}
