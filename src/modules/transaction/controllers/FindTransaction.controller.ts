import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionPresenter } from '../presenters/Transaction.presenter';
import { FindTransactionByIdService } from '../services/FindTransactionById.service';

@ApiTags('Transaction')
@Controller('transaction')
export class FindTransactionController {
  constructor(
    private readonly findTransactionByIdService: FindTransactionByIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Query('id') id: string,
  ) {
    const result = await this.findTransactionByIdService.execute({
      transactionId: id,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return TransactionPresenter.toHTTP(transaction);
  }
}
