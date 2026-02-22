import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { FindRecurringTransactionService } from '../services/FindRecurringTransaction.service';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class FindRecurringTransactionController {
  constructor(private readonly findService: FindRecurringTransactionService) {}

  @Get(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') id: string,
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
  ) {
    const result = await this.findService.execute({
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
