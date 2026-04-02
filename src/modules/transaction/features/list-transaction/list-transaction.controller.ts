import { ErrorPresenter } from '@infra/presenters/Error.presenter';
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
import { ListTransactionByIdHandler } from './list-transaction.handler';

@ApiTags('Transaction')
@Controller('transaction')
export class ListTransactionController {
  constructor(private readonly handler: ListTransactionByIdHandler) {}

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
    const data = await this.handler.execute({
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
      data: data.value.map(TransactionPreviewPresenter.toHTTP),
    };
  }
}
