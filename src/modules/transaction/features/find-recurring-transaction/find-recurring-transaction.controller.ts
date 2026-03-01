import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { RecurringTransactionPresenter } from '@modules/transaction/presenters/RecurringTransaction.presenter';
import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  FindRecurringTransactionPipe,
  FindRecurringTransactionRequest,
} from './find-recurring-transaction.dto';
import { FindRecurringTransactionHandler } from './find-recurring-transaction.handle';

@ApiTags('Recurring Transaction')
@Controller('transaction/recurring')
export class FindRecurringTransactionController {
  constructor(private readonly handler: FindRecurringTransactionHandler) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Body(FindRecurringTransactionPipe) body: FindRecurringTransactionRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: RecurringTransactionPresenter.toHTTP(data.value) };
  }
}
