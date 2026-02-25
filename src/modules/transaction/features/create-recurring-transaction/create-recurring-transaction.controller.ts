import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  CreateRecurringTransactionPipe,
  CreateRecurringTransactionRequest,
} from './create-recurring-transaction.dto';
import { CreateRecurringTransactionHandler } from './create-recurring-transaction.handle';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class CreateRecurringTransactionController {
  constructor(private readonly handler: CreateRecurringTransactionHandler) {}

  @Post('recurring')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(CreateRecurringTransactionPipe)
    body: CreateRecurringTransactionRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
