import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { RemoveUserFromWorkspaceService } from '../services/RemoveUserFromWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class RemoveUserFromWorkspaceController {
  constructor(
    private readonly removeUserFromWorkspaceService: RemoveUserFromWorkspaceService,
  ) {}

  @Delete(':workspaceId/users/:workspaceUserId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceUserId') workspaceUserId: string,
  ) {
    const result = await this.removeUserFromWorkspaceService.execute({
      workspaceUserId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
