import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { UpdateAccountDTO } from '@modules/account/dto/UpdateAccountDTO';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateAccountGateway } from '../gateways/UpdateAccount.gateway';
import { AccountPresenter } from '../presenters/Account.presenter';
import { UpdateAccountService } from '../services/UpdateAccount.service';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateAccountController {
  constructor(private readonly updateAccountService: UpdateAccountService) {}

  @Put(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param('id') id: string,
    @Body(UpdateAccountGateway) body: UpdateAccountDTO,
  ) {
    const result = await this.updateAccountService.execute({
      ...body,
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
