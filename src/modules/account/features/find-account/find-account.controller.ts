import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { AccountPresenter } from '@modules/account/presenters/Account.presenter';
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindAccountPipe, type FindAccountRequest } from './find-account.dto';
import { FindAccountByIdHandler } from './find-account.handler';

@ApiTags('Account')
@Controller('account')
@UseGuards(UseGuards)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class FindAccountController {
  constructor(private readonly handler: FindAccountByIdHandler) {}

  @Get(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param(FindAccountPipe) { accountId }: FindAccountRequest,
  ) {
    const data = await this.handler.execute({
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
