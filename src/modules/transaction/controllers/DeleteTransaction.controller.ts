import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { DeleteTransactionService } from '../services/DeleteTransaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class DeleteTransactionController {
  constructor(
    private readonly deleteTransactionService: DeleteTransactionService,
  ) {}

  @Delete('delete')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query() { transactionId }: FindTransactionDTO,
  ) {
    const result = await this.deleteTransactionService.execute({
      transactionId,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
