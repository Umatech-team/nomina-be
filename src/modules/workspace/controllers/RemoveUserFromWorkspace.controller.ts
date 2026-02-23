import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { RemoveUserFromWorkspaceService } from '../services/RemoveUserFromWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER)
export class RemoveUserFromWorkspaceController {
  constructor(
    private readonly removeUserFromWorkspaceService: RemoveUserFromWorkspaceService,
  ) {}

  @Delete(':workspaceId/users/:userId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    const result = await this.removeUserFromWorkspaceService.execute({
      workspaceId,
      userId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
