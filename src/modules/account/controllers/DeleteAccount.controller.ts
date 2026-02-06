import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteAccountService } from '../services/DeleteAccount.service';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER)
export class DeleteAccountController {
  constructor(private readonly deleteAccountService: DeleteAccountService) {}

  @Delete(':id')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param('id') id: string,
  ) {
    const result = await this.deleteAccountService.execute({
      accountId: id,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
