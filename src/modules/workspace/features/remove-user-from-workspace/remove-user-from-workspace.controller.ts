import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import {
    RemoveWorkspacePipe,
    type RemoveWorkspaceRequest,
} from './remove-user-from-workspace.dto';
import { RemoveUserFromWorkspaceService } from './remove-user-from-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER)
export class RemoveUserFromWorkspaceController {
  constructor(private readonly service: RemoveUserFromWorkspaceService) {}

  @Delete(':workspaceId/users/:userId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @Param(RemoveWorkspacePipe) { workspaceId, userId }: RemoveWorkspaceRequest,
  ) {
    const data = await this.service.execute({
      workspaceId,
      userId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }
  }
}
