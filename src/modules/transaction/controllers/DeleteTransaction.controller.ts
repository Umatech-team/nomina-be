import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { FindTransactionsGateway } from '../gateways/FindTransaction.gateway';
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
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(FindTransactionsGateway) body: FindTransactionDTO,
  ) {
    const result = await this.findTransactionByIdService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
