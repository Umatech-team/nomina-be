import { RecurrenceFrequency } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateRecurringTransactionGateway } from '../gateways/CreateRecurringTransaction.gateway';
import { RecurringTransactionPresenter } from '../presenters/RecurringTransaction.presenter';
import { CreateRecurringTransactionService } from '../services/CreateRecurringTransaction.service';

interface CreateRecurringTransactionBody {
  accountId: string;
  categoryId?: string | null;
  description: string;
  amount: number;
  frequency: RecurrenceFrequency;
  interval?: number;
  startDate: Date;
  endDate?: Date | null;
  active?: boolean;
}

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class CreateRecurringTransactionController {
  constructor(
    private readonly createService: CreateRecurringTransactionService,
  ) {}

  @Post('recurring')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(CreateRecurringTransactionGateway)
    body: CreateRecurringTransactionBody,
  ) {
    const result = await this.createService.execute({
      ...body,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { recurringTransaction } = result.value;

    return RecurringTransactionPresenter.toHTTP(recurringTransaction);
  }
}
