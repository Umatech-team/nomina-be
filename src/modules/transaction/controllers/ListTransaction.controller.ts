import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionPreviewPresenter } from '../presenters/TransactionPreview.presenter';
import { ListTransactionByIdService } from '../services/ListTransactionById.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ListTransactionController {
  constructor(
    private readonly listTransactionByIdService: ListTransactionByIdService,
  ) {}

  @Get('list')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: string,
    @Query('categoryId') categoryId: string,
    @Query('accountId') accountId: string,
    @Query('description') description: string,
    @Query('status') status: string,
  ) {
    const result = await this.listTransactionByIdService.execute({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      startDate,
      endDate,
      sub,
      workspaceId,
      type,
      categoryId,
      accountId,
      description,
      status,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return transaction.map(TransactionPreviewPresenter.toHTTP);
  }
}
