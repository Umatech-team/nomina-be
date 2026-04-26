import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { AccountPresenter } from '@modules/account/presenters/Account.presenter';
import { CheckLimit } from '@modules/subscription/decorators/CheckLimit.decorator';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { ResourceType } from '@modules/subscription/services/CheckSubscriptionLimits.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  CreateAccountPipe,
  type CreateAccountRequest,
} from './create-account.dto';
import { CreateAccountService } from './create-account.service';

@ApiTags('Account')
@Controller('account')
@UseGuards(RolesGuard)
@UseGuards(SubscriptionLimitsGuard)
@CheckLimit(ResourceType.ACCOUNT)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateAccountController {
  constructor(private readonly service: CreateAccountService) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Body(CreateAccountPipe) body: CreateAccountRequest,
  ) {
    const data = await this.service.execute({
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
