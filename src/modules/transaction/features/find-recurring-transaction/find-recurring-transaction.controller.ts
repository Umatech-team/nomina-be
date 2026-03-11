import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { RecurringTransactionPresenter } from '@modules/transaction/presenters/RecurringTransaction.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  FindRecurringTransactionPipe,
  type FindRecurringTransactionRequest,
} from './find-recurring-transaction.dto';
import { FindRecurringTransactionHandler } from './find-recurring-transaction.handle';

@ApiTags('Recurring Transaction')
@Controller('transaction/recurring')
export class FindRecurringTransactionController {
  constructor(private readonly handler: FindRecurringTransactionHandler) {}

  @Get(':recurringTransactionId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param(FindRecurringTransactionPipe) param: FindRecurringTransactionRequest,
  ) {
    const data = await this.handler.execute({
      ...param,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: RecurringTransactionPresenter.toHTTP(data.value) };
  }
}
