import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { AccountPresenter } from '@modules/account/presenters/Account.presenter';
import { CheckLimit } from '@modules/subscription/decorators/CheckLimit.decorator';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { ResourceType } from '@modules/subscription/services/CheckSubscriptionLimits.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateAccountPipe, CreateAccountRequest } from './create-account.dto';
import { CreateAccountHandler } from './create-account.handler';

@ApiTags('Account')
@Controller('account')
@UseGuards(RolesGuard)
@UseGuards(SubscriptionLimitsGuard)
@CheckLimit(ResourceType.ACCOUNT)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateAccountController {
  constructor(private readonly handler: CreateAccountHandler) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Body(CreateAccountPipe) body: CreateAccountRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: AccountPresenter.toHTTP(data.value),
    };
  }
}
