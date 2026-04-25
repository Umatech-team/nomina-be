import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    UpdateTransactionPipe,
    type UpdateTransactionRequest,
} from './update-transaction.dto';
import { UpdateTransactionService } from './update-transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class UpdateTransactionController {
  constructor(private readonly service: UpdateTransactionService) {}

  @Put(':transactionId') @HttpCode(statusCode.OK) async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(UpdateTransactionPipe)
    body: UpdateTransactionRequest,
    @Param('transactionId') transactionId: string,
  ) {
    const data = await this.service.execute({
      ...body,
      sub,
      workspaceId,
      transactionId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: TransactionPresenter.toHTTP(data.value),
    };
  }
}
