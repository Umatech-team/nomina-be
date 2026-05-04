import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  FindTransactionPipe,
  type FindTransactionRequest,
} from './find-transaction.dto';
import { FindTransactionByIdService } from './find-transaction.handle';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER)
@ApiTags('Transaction')
@Controller('transaction')
export class FindTransactionController {
  constructor(private readonly service: FindTransactionByIdService) {}

  @Get(':transactionId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param(FindTransactionPipe) { transactionId }: FindTransactionRequest,
  ) {
    const data = await this.service.execute({
      workspaceId,
      transactionId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: TransactionPresenter.toHTTP(data.value) };
  }
}
