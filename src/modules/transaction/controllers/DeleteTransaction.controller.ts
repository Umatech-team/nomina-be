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
    private readonly findTransactionByIdService: DeleteTransactionService,
  ) {}

  @Delete('delete')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query('id') transactionId: FindTransactionDTO,
  ) {
    const result = await this.findTransactionByIdService.execute({
      transactionId: Number(transactionId),
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
