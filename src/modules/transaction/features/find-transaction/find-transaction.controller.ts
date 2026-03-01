import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  FindTransactionPipe,
  FindTransactionRequest,
} from './find-transaction.dto';
import { FindTransactionByIdHandler } from './find-transaction.handle';

@ApiTags('Transaction')
@Controller('transaction')
export class FindTransactionController {
  constructor(private readonly handler: FindTransactionByIdHandler) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(FindTransactionPipe) { transactionId }: FindTransactionRequest,
  ) {
    const data = await this.handler.execute({
      sub,
      transactionId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
