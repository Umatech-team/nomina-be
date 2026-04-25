import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    CreateTransactionPipe,
    type CreateTransactionRequest,
} from './create-transaction.dto';
import { CreateTransactionService } from './create-transaction.handle';

@ApiTags('Transaction')
@Controller('transaction')
export class CreateTransactionController {
  constructor(private readonly service: CreateTransactionService) {}

  @Post()
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(CreateTransactionPipe) body: CreateTransactionRequest,
  ) {
    const data = await this.service.execute({
      ...body,
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
