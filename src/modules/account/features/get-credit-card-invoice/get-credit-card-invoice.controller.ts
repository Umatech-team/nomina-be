import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CreditCardInvoicePresenter } from '@modules/account/presenters/CreditCardInvoice.presenter';
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  GetCreditCardInvoicePipe,
  type GetCreditCardInvoiceRequest,
} from './get-credit-card-invoice.dto';
import { GetCreditCardInvoiceHandler } from './get-credit-card-invoice.handler';

@ApiTags('Account')
@Controller('account')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class GetCreditCardInvoiceController {
  constructor(private readonly handler: GetCreditCardInvoiceHandler) {}

  @Get(':id/invoice')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Param('id') accountId: string,
    @Query(GetCreditCardInvoicePipe) query: GetCreditCardInvoiceRequest,
  ) {
    const data = await this.handler.execute({
      ...query,
      accountId,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: CreditCardInvoicePresenter.toHTTP(data.value),
    };
  }
}
