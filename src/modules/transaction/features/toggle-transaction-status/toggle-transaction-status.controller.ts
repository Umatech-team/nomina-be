import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ToggleTransactionStatusService } from './toggle-transaction-status.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ToggleTransactionStatusController {
  constructor(private readonly service: ToggleTransactionStatusService) {}

  @Patch('recurring/:id/status')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') transactionId: string,
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
  ) {
    const data = await this.service.execute({
      transactionId,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
