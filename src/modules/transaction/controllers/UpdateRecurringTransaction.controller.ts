import { RecurrenceFrequency } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateRecurringTransactionGateway } from '../gateways/UpdateRecurringTransaction.gateway';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { UpdateRecurringTransactionService } from '../services/UpdateRecurringTransaction.service';

interface UpdateRecurringTransactionBody {
  categoryId?: string | null;
  description?: string;
  amount?: bigint;
  frequency?: RecurrenceFrequency;
  interval?: number;
  startDate?: Date;
  endDate?: Date | null;
}

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class UpdateRecurringTransactionController {
  constructor(
    private readonly updateService: UpdateRecurringTransactionService,
  ) {}

  @Patch('recurring/:id')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('id') id: string,
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(UpdateRecurringTransactionGateway)
    body: UpdateRecurringTransactionBody,
  ) {
    const result = await this.updateService.execute({
      ...body,
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
