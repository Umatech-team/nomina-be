import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteRecurringTransactionService } from './delete-recurring-transaction.service';

@ApiTags('Recurring Transaction')
@Controller('transaction')
export class DeleteRecurringTransactionController {
  constructor(
    private readonly deleteService: DeleteRecurringTransactionService,
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
