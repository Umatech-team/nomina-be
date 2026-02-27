import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  UpdateTransactionPipe,
  UpdateTransactionRequest,
} from './update-transaction.dto';
import { UpdateTransactionHandler } from './update-transaction.handler';

@ApiTags('Transaction')
@Controller('transaction')
export class UpdateTransactionController {
  constructor(private readonly handler: UpdateTransactionHandler) {}

  @Put(':transactionId') @HttpCode(statusCode.OK) async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(UpdateTransactionPipe)
    body: Omit<UpdateTransactionRequest, 'transactionId'>,
    @Param('transactionId') transactionId: string,
  ) {
    const data = await this.handler.execute({
      ...body,
      sub,
      workspaceId,
      transactionId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      transaction: TransactionPresenter.toHTTP(data.value),
    };
  }
}
