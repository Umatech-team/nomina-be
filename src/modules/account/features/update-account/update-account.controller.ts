import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { AccountPresenter } from '@modules/account/presenters/Account.presenter';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateAccountPipe, UpdateAccountRequest } from './update-account.dto';
import { UpdateAccountHandler } from './update-account.handler';

@ApiTags('Account')
@Controller('account')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateAccountController {
  constructor(private readonly handler: UpdateAccountHandler) {}

  @Put(':accountId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param('accountId') { accountId }: Pick<UpdateAccountRequest, 'accountId'>,
    @Body(UpdateAccountPipe) body: UpdateAccountRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      accountId,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: AccountPresenter.toHTTP(data.value),
    };
  }
}
