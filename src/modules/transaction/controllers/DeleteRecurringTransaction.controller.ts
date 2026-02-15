import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteRecurringTransactionService } from '../services/DeleteRecurringTransaction.service';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class DeleteRecurringTransactionController {
  constructor(
    private readonly deleteService: DeleteRecurringTransactionService,
  ) {}

  @Delete('recurring/:id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') id: string,
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
  ) {
    const result = await this.deleteService.execute({
      recurringTransactionId: id,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return result.value;
  }
}
