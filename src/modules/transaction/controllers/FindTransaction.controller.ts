import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { CreateTransactionGateway } from '../gateways/CreateTransaction.gateway';
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
    @Body(CreateTransactionGateway) body: FindTransactionDTO,
  ) {
    const result = await this.findTransactionByIdService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return TransactionPresenter.toHTTP(transaction);
  }
}
