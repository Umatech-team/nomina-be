import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListTransactionsDTO } from '../dto/ListTransactionsDTO';
import { CreateTransactionGateway } from '../gateways/CreateTransaction.gateway';
import { TransactionPreviewPresenter } from '../presenters/TransactionPreview.presenter';
import { ListTransactionByIdService } from '../services/ListTransactionById.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ListTransactionController {
  constructor(
    private readonly findTransactionByIdService: ListTransactionByIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(CreateTransactionGateway) body: ListTransactionsDTO,
  ) {
    const result = await this.findTransactionByIdService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return transaction.map(TransactionPreviewPresenter.toHTTP);
  }
}
