import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { AccountPresenter } from '../presenters/Account.presenter';
import { FindAccountByIdService } from '../services/FindAccountById.service';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class FindAccountController {
  constructor(
    private readonly findAccountByIdService: FindAccountByIdService,
  ) {}

  @Get(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param('id') id: string,
  ) {
    const result = await this.findAccountByIdService.execute({
      accountId: id,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { account } = result.value;

    return AccountPresenter.toHTTP(account);
  }
}
