import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPreviewPresenter } from '@modules/transaction/presenters/TransactionPreview.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-01-01',
    description: 'Formato YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-01-31',
    description: 'Formato YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['INCOME', 'EXPENSE', 'TRANSFER'],
  })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'COMPLETED'] })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
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
