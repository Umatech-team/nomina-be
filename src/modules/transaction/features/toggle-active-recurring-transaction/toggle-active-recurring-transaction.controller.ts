import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { RecurringTransactionPresenter } from '@modules/transaction/presenters/RecurringTransaction.presenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ToggleActiveRecurringTransactionHandler } from './toggle-active-recurring-transaction.handler';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class ToggleActiveRecurringTransactionController {
  constructor(
    private readonly toggleService: ToggleActiveRecurringTransactionHandler,
  ) {}

  @Patch('recurring/active/:recurringTransactionId')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('recurringTransactionId') recurringTransactionId: string,
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
  ) {
    const data = await this.toggleService.execute({
      recurringTransactionId,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: RecurringTransactionPresenter.toHTTP(data.value) };
  }
}
