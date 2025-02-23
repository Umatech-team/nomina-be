import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionPreviewPresenter } from '../presenters/TransactionPreview.presenter';
import { ListTransactionByIdService } from '../services/ListTransactionById.service';

@ApiTags('Transaction')
@Controller('transaction/list')
export class ListTransactionController {
  constructor(
    private readonly listTransactionByIdService: ListTransactionByIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const result = await this.listTransactionByIdService.execute({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      startDate,
      endDate,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return transaction.map(TransactionPreviewPresenter.toHTTP);
  }
}
