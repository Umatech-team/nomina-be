import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionPresenter } from '../presenters/Transaction.presenter';
import { ToggleTransactionStatusService } from '../services/ToggleTransactionStatus.service';

@ApiTags('Transaction')
@Controller('transaction')
export class ToggleTransactionStatusController {
  constructor(
    private readonly toggleStatusService: ToggleTransactionStatusService,
  ) {}

  @Patch('toggle-status/:id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') transactionId: string,
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
  ) {
    const result = await this.toggleStatusService.execute({
      transactionId,
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return {
      transaction: TransactionPresenter.toHTTP(result.value.transaction),
    };
  }
}
