import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { MoneyUtils } from '@utils/MoneyUtils';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateTransactionDTO } from '../dto/UpdateTransactionDTO';
import { UpdateTransactionGateway } from '../gateways/UpdateTransaction.gateway';
import { TransactionPreviewPresenter } from '../presenters/TransactionPreview.presenter';
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
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(UpdateTransactionGateway)
    body: UpdateTransactionDTO,
  ) {
    const result = await this.updateTransactionService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { transaction, newBalance } = result.value;

    return {
      transaction: TransactionPreviewPresenter.toHTTP(transaction),
      newBalance: MoneyUtils.centsToDecimal(newBalance), // Formatado de centavos para decimal
      newBalanceFormatted: MoneyUtils.formatCents(newBalance, 'BRL'), // Formatado para exibição
    };
  }
}
