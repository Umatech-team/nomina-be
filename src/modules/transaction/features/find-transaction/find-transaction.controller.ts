import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    FindTransactionPipe,
    type FindTransactionRequest,
} from './find-transaction.dto';
import { FindTransactionByIdService } from './find-transaction.handle';

@ApiTags('Transaction')
@Controller('transaction')
export class FindTransactionController {
  constructor(private readonly service: FindTransactionByIdService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(FindTransactionPipe) { transactionId }: FindTransactionRequest,
  ) {
    const data = await this.service.execute({
      sub,
      transactionId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
