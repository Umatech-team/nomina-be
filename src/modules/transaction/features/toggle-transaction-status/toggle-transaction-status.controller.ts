import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ToggleTransactionStatusHandler } from './toggle-transaction-status.handler';

@ApiTags('Transaction')
@Controller('transaction')
export class ToggleTransactionStatusController {
  constructor(private readonly handler: ToggleTransactionStatusHandler) {}

  @Patch('recurring/status/:id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') transactionId: string,
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
  ) {
    const data = await this.handler.execute({
      transactionId,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
