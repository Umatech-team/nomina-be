import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteRecurringTransactionHandler } from './delete-recurring-transaction.handler';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class DeleteRecurringTransactionController {
  constructor(
    private readonly deleteService: DeleteRecurringTransactionHandler,
  ) {}

  @Delete('recurring/:recurringTransactionId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @Param('recurringTransactionId') recurringTransactionId: string,
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
  ) {
    const result = await this.deleteService.execute({
      recurringTransactionId,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
