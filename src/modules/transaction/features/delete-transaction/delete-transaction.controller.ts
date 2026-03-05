import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  DeleteTransactionPipe,
  type DeleteTransactionRequest,
} from './delete-transaction.dto';
import { DeleteTransactionHandler } from './delete-transaction.handler';

@ApiTags('Transaction')
@Controller('transaction')
export class DeleteTransactionController {
  constructor(
    private readonly deleteTransactionService: DeleteTransactionHandler,
  ) {}

  @Delete(':transactionId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Param(DeleteTransactionPipe) { transactionId }: DeleteTransactionRequest,
  ) {
    const data = await this.deleteTransactionService.execute({
      transactionId,
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }
  }
}
