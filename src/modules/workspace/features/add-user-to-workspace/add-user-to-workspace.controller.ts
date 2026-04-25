import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';

import {
    AddWorkspaceUserPipe,
    type AddWorkspaceUserRequest,
} from './add-user-to-workspace.dto';
import { AddUserToWorkspaceService } from './add-user-to-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class AddUserToWorkspaceController {
  constructor(private readonly service: AddUserToWorkspaceService) {}

  @Post(':workspaceId/users')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId')
    { workspaceId }: Pick<AddWorkspaceUserRequest, 'workspaceId'>,
    @Body(AddWorkspaceUserPipe)
    body: Omit<AddWorkspaceUserRequest, 'workspaceId'>,
  ) {
    const data = await this.service.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: WorkspaceUserPresenter.toHTTP(data.value),
    };
  }
}
