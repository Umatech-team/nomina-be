import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { TransactionPresenter } from '@modules/transaction/presenters/Transaction.presenter';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  PayCreditCardInvoicePipe,
  type PayCreditCardInvoiceRequest,
} from './pay-credit-card-invoice.dto';
import { PayCreditCardInvoiceHandler } from './pay-credit-card-invoice.handler';

@ApiTags('Account')
@Controller('account')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class PayCreditCardInvoiceController {
  constructor(private readonly handler: PayCreditCardInvoiceHandler) {}

  @Post(':id/invoice/pay')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Param('id') creditCardAccountId: string,
    @Body(PayCreditCardInvoicePipe) body: PayCreditCardInvoiceRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      creditCardAccountId,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: TransactionPresenter.toHTTP(data.value),
    };
  }
}
