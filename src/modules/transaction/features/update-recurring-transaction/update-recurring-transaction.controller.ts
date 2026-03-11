import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { RecurringTransactionPresenter } from '@modules/transaction/presenters/RecurringTransaction.presenter';
import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  UpdateRecurringTransactionPipe,
  type UpdateRecurringTransactionRequest,
} from './update-recurring-transaction.dto';
import { UpdateRecurringTransactionHandler } from './update-recurring-transaction.handler';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class UpdateRecurringTransactionController {
  constructor(private readonly handler: UpdateRecurringTransactionHandler) {}

  @Patch('recurring/:recurringTransactionId')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('recurringTransactionId') recurringTransactionId: string,
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Body(UpdateRecurringTransactionPipe)
    body: UpdateRecurringTransactionRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      recurringTransactionId,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: RecurringTransactionPresenter.toHTTP(data.value) };
  }
}
