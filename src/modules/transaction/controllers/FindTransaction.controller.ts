import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TransactionPresenter } from '../presenters/Transaction.presenter';
import { FindTransactionByIdService } from '../services/FindTransactionById.service';

@ApiTags('Transaction')
@Controller('transaction/find')
export class FindTransactionController {
  constructor(
    private readonly findTransactionByIdService: FindTransactionByIdService,
  ) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Query('id') id: string,
  ) {
    const result = await this.findTransactionByIdService.execute({
      transactionId: parseInt(id),
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return TransactionPresenter.toHTTP(transaction);
  }
}
