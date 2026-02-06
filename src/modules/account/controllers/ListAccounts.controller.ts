import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { ListAccountsDTO } from '@modules/account/dto/ListAccountsDTO';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListAccountsGateway } from '../gateways/ListAccounts.gateway';
import { AccountPresenter } from '../presenters/Account.presenter';
import { ListAccountsService } from '../services/ListAccounts.service';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class ListAccountsController {
  constructor(private readonly listAccountsService: ListAccountsService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Query(ListAccountsGateway) query: ListAccountsDTO,
  ) {
    const result = await this.listAccountsService.execute({
      ...query,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { accounts, total } = result.value;

    return {
      accounts: accounts.map(AccountPresenter.toHTTP),
      total,
    };
  }
}
