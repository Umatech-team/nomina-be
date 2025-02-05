import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CreateTransactionDTO } from '@modules/transaction/dto/CreateTransactionDTO';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateTransactionGateway } from '../gateways/CreateTransaction.gateway';
import { CreateTransactionService } from '../services/CreateTransaction.service';
import { TransactionPreviewPresenter } from '../presenters/TransactionPreview.presenter';

@ApiTags('Transaction')
@Controller('transaction')
export class CreateTransactionController {
  constructor(
    private readonly createTransactionService: CreateTransactionService,
  ) {}

  @Public()
  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(CreateTransactionGateway) body: CreateTransactionDTO,
  ) {
    const result = await this.createTransactionService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction, newBalance } = result.value;

    return {
      transaction: TransactionPreviewPresenter.toHTTP(transaction),
      newBalance,
    };
  }
}
