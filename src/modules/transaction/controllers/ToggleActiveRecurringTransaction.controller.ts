import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { ToggleActiveRecurringTransactionService } from '../services/ToggleActiveRecurringTransaction.service';

@ApiTags('Recurring Transaction')
@Controller('recurring-transaction')
export class ToggleActiveRecurringTransactionController {
  constructor(
    private readonly toggleService: ToggleActiveRecurringTransactionService,
  ) {}

  @Patch('toggle-active/:id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') id: string,
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
  ) {
    const result = await this.toggleService.execute({
      recurringTransactionId: id,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { recurringTransaction } = result.value;

    return {
      recurringTransaction:
        RecurringTransactionPresenter.toHTTP(recurringTransaction),
    };
  }
}
