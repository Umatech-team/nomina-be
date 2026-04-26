import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  DeleteAccountPipe,
  type DeleteAccountRequest,
} from './delete-account.dto';
import { DeleteAccountService } from './delete-account.handler';

@ApiTags('Account')
@Controller('account')
@Roles(UserRole.OWNER)
export class DeleteAccountController {
  constructor(private readonly service: DeleteAccountService) {}

  @Delete(':accountId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Param(DeleteAccountPipe) { accountId }: DeleteAccountRequest,
  ) {
    const result = await this.service.execute({
      accountId,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
