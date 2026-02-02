import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateTransactionDTO } from '../dto/UpdateTransactionDTO';
import { UpdateTransactionGateway } from '../gateways/UpdateTransaction.gateway';
import { TransactionPresenter } from '../presenters/Transaction.presenter';
import { UpdateTransactionService } from '../services/UpdateTransaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class UpdateTransactionController {
  constructor(
    private readonly updateTransactionService: UpdateTransactionService,
  ) {}

  @Patch('/update')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(UpdateTransactionGateway)
    body: UpdateTransactionDTO,
  ) {
    const result = await this.updateTransactionService.execute({
      ...body,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction } = result.value;

    return {
      transaction: TransactionPresenter.toHTTP(transaction),
    };
  }
}
