import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CreateAccountDTO } from '@modules/account/dto/CreateAccountDTO';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateAccountGateway } from '../gateways/CreateAccount.gateway';
import { AccountPresenter } from '../presenters/Account.presenter';
import { CreateAccountService } from '../services/CreateAccount.service';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateAccountController {
  constructor(private readonly createAccountService: CreateAccountService) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Body(CreateAccountGateway) body: CreateAccountDTO,
  ) {
    const result = await this.createAccountService.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { account } = result.value;

    return AccountPresenter.toHTTP(account);
  }
}
